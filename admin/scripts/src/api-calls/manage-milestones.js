import fetch from 'node-fetch';

export const manageMilestones = async ({ modules = {}, env = {} }) => {
  const milestonesURL = `https://api.github.com/repos/${env.user}/${env.repo}/milestones`;
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    Authorization: `Bearer ${env.token}`,
  };

  const milestones = await fetch(`${milestonesURL}?state=all`, {
    headers,
  }).then((res) => res.json());
  milestones.sort((a, b) => a.number - b.number);

  const path = modules.path;

  // === update existing milestones ===

  for (const milestone of milestones) {
    // search for a module with the same name or number as this milestone
    const module = path.find(
      (module) =>
        module.name === milestone.title ||
        module.milestone === milestone.number,
    );

    // close milestones that don't have a corresponding module
    if (!module) {
      await fetch(`${milestonesURL}/${milestone.number}`, {
        method: 'PATCH',
        body: JSON.stringify({ state: 'closed' }),
        headers,
      });

      continue;
    }

    // make sure the local module has the correct number
    if (module.milestone !== milestone.number) {
      module.milestone = milestone.number;
    }
    // sync modules to milestone if fields are empty
    if (!module.name) {
      module.name = milestone.title;
    }
    if (!module.description) {
      module.description = milestone.description;
    }
    if (!module.state) {
      module.state = milestone.state;
    }

    // otherwise sync the milestone to the local module data
    const newBody = {};

    if (module.name !== milestone.title) {
      newBody.title = module.name;
    }
    if (module.description !== milestone.description) {
      newBody.description = module.description;
    }
    if (module.state && module.state !== milestone.state) {
      newBody.state = module.state;
    }

    if (JSON.stringify(newBody) !== '{}') {
      await fetch(`${milestonesURL}/${milestone.number}`, {
        method: 'PATCH',
        body: JSON.stringify(newBody),
        headers,
      });
    }
  }

  // === create new milestones ===
  const toCreate = path.filter(
    (module) =>
      !milestones.find((milestone) => milestone.title === module.name) &&
      !milestones.find((milestone) => milestone.number === module.number),
  );
  for (const module of toCreate) {
    await fetch(milestonesURL, {
      method: 'POST',
      body: JSON.stringify({
        title: module.name,
        state: module.state,
        description: module.description,
      }),
      headers,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          module.milestone = data.number;
          module.state && (module.state = data.state);
        }
      });
  }
};
