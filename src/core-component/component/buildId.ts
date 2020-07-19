export function buildId(primaryKeys: string[], route: any): any {
  if (!route) {
    return null;
  }
  const param: any = route.history.current.params;
  if (!(primaryKeys && primaryKeys.length > 0)) {
    return null;
  } else {
    const id: any = {};
    for (const key of primaryKeys) {
      const v = param[key];
      if (!v) {
        return null;
      }
      id[key] = v;
    }
    return id;
  }
}
