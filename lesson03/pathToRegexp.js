function pathToRegexp(rule) {
  const keys = [];
  const regExpStr = rule
    .replace('/(/', '(?:')
    .replace('/\/\:(\w+)/', (_, k) => {
      keys.push(k);
      return ('/(\\w+)');
    }).replace('/\*/', '.*');

  return {
    ruleRE: new RegExp(`^$${regExpStr}$`),
    keys,
  };
}

exports.pathToRegexp = pathToRegexp;
