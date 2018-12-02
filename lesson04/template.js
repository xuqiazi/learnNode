function template(title, content) {
  const body =
      `<html>
      <head>
      <meta charset="UTF-8">
      <meta http-equiv-"Content-Type" content="text/html"/>
      <title>${title}</title>
      </head>
      <body>
      ${content}
      </body>
      </html>`;
  return body;
}


exports.template = template;
