import fetch from 'node-fetch';

// refactor: compare all user names as lower case

export const manageCollaborators = async (
  { env = {}, learners = [], admins = [], coaches = [] },
  // if true, users removed from config are booted from the org
  //  otherwise they are simply removed from teams
  harsh = false,
) => {
  //  ===  constants  ===

  const ORG_URL = `https://api.github.com/orgs/${env.user}`;

  const HEADERS = {
    Accept: 'application/vnd.github.v3+json',
    Authorization: `Bearer ${env.token}`,
  };

  //  ===  helper functions  ===

  const tokenedFetch = (url = '', method = 'GET', body = {}) => {
    const options = { method, headers: HEADERS };
    if (method.toLowerCase() !== 'get') {
      options.body = JSON.stringify(body);
    }

    return fetch(url, options).then((res) => {
      try {
        return res.json();
      } catch (err) {
        return res.text();
      }
    });
  };

  const teamifyUsers = (users = [], tag = '') =>
    users.map((user) => ({
      ...user,
      teams: Array.isArray(user.teams) ? [...user.teams, tag] : [tag],
    }));

  //  ===   ===  pre-process all locally configured users  ===   ===

  const teamedLearners = teamifyUsers(learners, 'learners');
  const teamedCoaches = teamifyUsers(coaches, 'coaches');
  const teamedAdmins = teamifyUsers(admins, 'admins');

  const localUsers = [
    ...teamedLearners,
    ...teamedAdmins,
    ...teamedCoaches,
  ].reduce((all, next) => {
    const userExists = all.find((user) => user.user === next.user);
    if (userExists) {
      userExists.teams.push(...next.teams);
      return all;
    } else {
      return [...all, { ...next }];
    }
  }, []);
  // console.log('local users', localUsers);

  //  ===   ===  fetch all the initial data  ===   ===

  const [orgMembers, invitations, failedInvites, teams] = await Promise.all([
    tokenedFetch(`${ORG_URL}/members`),
    tokenedFetch(`${ORG_URL}/invitations`),
    tokenedFetch(`${ORG_URL}/failed_invitations`),
    tokenedFetch(`${ORG_URL}/teams`),
  ]);
  // console.log('org members', orgMembers);
  // console.log('invitations', invitations);
  // console.log('failed invites', failedInvites);
  // console.log('teams', teams);

  //  ===   ===  pre-process all org users  ===   ===

  const populatedTeams = await Promise.all(
    teams.map((team) =>
      tokenedFetch(team.url + '/members').then((members) => ({
        team,
        members,
      })),
    ),
  );
  // console.log('populated teams', populatedTeams);
  // console.log('populated teams', JSON.stringify(populatedTeams, null, '  '));

  const membersWithStatus = await Promise.all(
    orgMembers.map((member) =>
      tokenedFetch(`${ORG_URL}/memberships/${member.login}`).then(
        (membership) => ({ ...member, membership }),
      ),
    ),
  );
  // console.log('members with status', membersWithStatus);

  const membersWithTeams = membersWithStatus.map((member) => {
    member.teams = [];
    for (const team of populatedTeams) {
      if (
        team.members.find((teamMember) => teamMember.login === member.login)
      ) {
        member.teams.push(team.team.name);
      }
    }
    return member;
  });
  // console.log('teamed members', membersWithTeams);

  //  ===   ===  sort & organize remote and local users  ===   ===

  // people that are org members but not listed locally
  const toRemove = membersWithTeams.filter(
    (member) => !localUsers.find((user) => user.user === member.login),
  );
  // console.log('to remove', toRemove);

  // people that need to be invited
  const toInvite = localUsers
    // don't reinvite someone with a pending invite
    .filter((user) => !invitations.find((member) => user.user === member.login))
    // don't invite someone who is already a member
    .filter(
      (user) => !membersWithTeams.find((member) => user.user === member.login),
    )
    // do reinvite people with a failed invitation
    .concat(
      failedInvites.map((failedInvite) => ({ user: failedInvite.login })),
    );
  const usersToInvite = await Promise.all(
    toInvite.map((user) =>
      tokenedFetch(`https://api.github.com/users/${user.user}`),
    ),
  );
  // console.log('users to invite', usersToInvite);

  // members who need their teams changed
  const toReTeam = membersWithTeams
    // don't bother reteaming someone who will be removed
    .filter(
      (member) => !toRemove.find((leaver) => leaver.login === member.login),
    )
    .filter((teamedMember) => {
      const localUser = localUsers.find(
        (user) => user.user === teamedMember.login,
      );
      if (!localUser) {
        return false;
      }
      return (
        teamedMember.teams?.length !== localUser.teams?.length ||
        !teamedMember.teams?.every((team) => localUser.teams?.includes(team))
      );
    })
    .map((teamedMember) => ({
      ...teamedMember,
      localTeams: localUsers.find((user) => user.user === teamedMember.login)
        .teams,
    }));
  // console.log('to reteam', toReTeam);

  // people who should be "downgraded" from admin to member
  const toDeAdmin = membersWithTeams
    .filter((member) => {
      const localUser = localUsers.find((user) => user.user === member.login);
      return !localUser || !localUser.teams.includes('admins');
    })
    .filter((member) => member.membership.role === 'admin');
  // console.log('to deadmin', toDeAdmin);

  // people added to admins.yml who are not admins in the org
  const toAdmin = localUsers
    .filter((user) => user.teams?.includes('admins'))
    .filter((user) =>
      membersWithTeams.find(
        (teamMember) =>
          user.user === teamMember.login &&
          teamMember.membership.role !== 'admin',
      ),
    );
  // console.log('to admin', toAdmin);

  //  ===  ===  do the API calls  ===  ===

  // invite new users (including failed invitations)
  const sentInvitations = toInvite.map((user) => {
    return tokenedFetch(`${ORG_URL}/invitations`, 'POST', {
      invitee_id: usersToInvite.find(
        (invitee) => invitee.login.toLowerCase() === user.user.toLowerCase(),
      ).id,
      team_ids: Array.isArray(user.teams)
        ? teams
            .filter((team) => user.teams.includes(team.name))
            .map((team) => team.id)
        : [],
      role:
        Array.isArray(user.teams) && user.teams.includes('admins')
          ? 'admin'
          : 'direct_member',
    });
  });

  // remove extra users
  const booted = toRemove.flatMap((member) =>
    harsh
      ? [tokenedFetch(`${ORG_URL}/members/${member.login}`, 'DELETE')]
      : Array.isArray(member.teams)
      ? member.teams
          // assumes remote team names align with file names
          .map((teamSlug) =>
            tokenedFetch(
              `${ORG_URL}/teams/${teamSlug}/memberships/${member.login}`,
              'DELETE',
            ),
          )
      : [],
  );

  // update users' team membership in the org
  const reTeaming = toReTeam
    .map((member) => {
      member.addTo = member.localTeams.filter(
        (team) => !member.teams.includes(team),
      );
      member.removeFrom = member.teams.filter(
        (team) => !member.localTeams.includes(team),
      );
      return member;
    })
    .flatMap((member) => {
      const addCalls = member.addTo.map((team) => {
        return tokenedFetch(
          `${ORG_URL}/teams/${team}/memberships/${member.login}`,
          'PUT',
          { team_slug: team },
        );
      });
      const removeCalls = member.removeFrom.map((team) => {
        return fetch(`${ORG_URL}/teams/${team}/memberships/${member.login}`, {
          method: 'DELETE',
          headers: HEADERS,
          body: JSON.stringify({ team_slug: team }),
        });
      });

      return [...addCalls, ...removeCalls];
    });
  // console.log('re teaming', reTeaming);

  // remove admin access to users that were in admin but no longer
  const deAdmined = toDeAdmin.map((member) =>
    tokenedFetch(`${ORG_URL}/memberships/${member.login}`, 'PUT', {
      role: 'member',
    }),
  );
  // grant admin access to users that have been added to local admin config
  const admined = toAdmin.map((member) =>
    tokenedFetch(`${ORG_URL}/memberships/${member.user}`, 'PUT', {
      role: 'admin',
    }),
  );

  await Promise.allSettled([
    ...sentInvitations,
    ...booted,
    ...reTeaming,
    ...deAdmined,
    ...admined,
  ]);
};
