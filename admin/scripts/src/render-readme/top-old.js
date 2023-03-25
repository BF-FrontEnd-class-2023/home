const nameToTitle = (name = '') =>
  typeof name !== 'string'
    ? ''
    : name
        .split('-')
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(' ');

export const top = ({ env = {}, modules = {}, org = {} }) =>
  `# ${env.repo ? nameToTitle(env.repo) : 'Study Repo'}: ${nameToTitle(
    env.user,
  )}

> <details>
> <summary>Tech Support</summary>
>
> <a href="https://rubberduckdebugging.com/" target="_blank"><img alt="Rubber Ducky" src="./assets/rubber-ducky.png"/></a>
>
>  </details>

- [Class Calendar](${org.calendar})
- Modules
  - [Quick Links](#modules)
  - [Details](https://${env.user}.github.io/${env.repo}/modules)
  - [Study Board](https://github.com/${env.user}/${env.repo}/projects/${
    modules.board
  })
${
  org.forum
    ? `- [${
        org.forum.includes('discord')
          ? 'Discord'
          : org.forum.includes('slack')
          ? 'Slack'
          : 'Forum'
      }](${org.forum})`
    : `- [Discussions](https://github.com/${env.user}/${env.repo}/discussions)`
}
- [Issues](https://github.com/${env.user}/${env.repo}/issues)
- [Pull Requests](https://github.com/${env.user}/${env.repo}/pulls)
- People
  - [Learners](#learners) - [Randomizer](https://${env.user}.github.io/${
    env.repo
  }/randomizer)
  - [Coaches](#coaches)
  - [Admins](#admins)
- [Cheat Sheets](./cheat-sheets)
- [Guides](./guides)
  - [Study Tips](./guides/study-tips)
  - [Class Workflows](./guides/class-workflows)
  - [Planning and Collaborating](https://github.com/hackyourfuturebelgium/planning-and-collaborating)

---

`;
