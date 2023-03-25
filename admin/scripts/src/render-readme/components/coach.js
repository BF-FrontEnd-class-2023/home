export const coach = (
  { env = {}, org = {} },
  { name = '', user = '', homePage = '', modules = [] },
) => {
  const repoURL = `https://github.com/${env.user}/${env.repo}`;

  // --- scoped utilities for generating links ---

  const aList = (...rows) => rows.map((row) => row.join(' | ')).join('<br>');

  // --- build the section ---

  const header = `<h3 id="${user || name}">${name}</h3>`;

  const avatar = `<img src="./${env.assetsPath.join(
    '/',
  )}/avatars/${user}.png" height="200px" width="200px" alt="${user} avatar" />`;

  const selfLinks = [`<a href="https://github.com/${user}">${user}</a>`];
  if (homePage) {
    selfLinks.push(`<a href="${homePage}">home page</a>`);
  }
  if (!org.forum) {
    selfLinks.push(
      `<a href="${repoURL}/discussions?discussions_q=involves%3A${user}">discussions</a>`,
    );
  }

  const issuesLinks = [
    `<a href="${repoURL}/issues?q=author%3A${user}">opened</a>`,
    `<a href="${repoURL}/issues?q=assignee%3A${user}">assigned</a>`,
    `<a href="${repoURL}/issues?q=commenter%3A${user}">commented</a>`,
    `<a href="${repoURL}/issues?q=mentions%3A${user}">mentioned</a>`,
  ];

  const linksList = aList(selfLinks, issuesLinks);

  const modulesList =
    modules.length > 0
      ? `modules:<ul>${modules
          .map((module) => `<li>${module}</li>`)
          .join('')}</ul>`
      : '';

  return `

${
  user
    ? `<table><tr><th> ${avatar} </th><th> ${header}<br>${linksList}<br>${modulesList} </th></tr></table>`
    : header
}

`;
};
