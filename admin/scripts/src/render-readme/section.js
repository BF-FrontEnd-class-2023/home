export const section = (
  config,
  { title = '', intro = '', component = () => {}, data = [], collapse = false },
) =>
  `

## ${title}

${intro}

${collapse ? '<details>\n<summary>expand/collapse</summary>\n<br />' : ''}

${data.map((item) => component(config, item)).join('\n\n')}

${collapse ? '</details>' : ''}

---

`;
