const showMe = (yourObject: any): string => {
  function replacer(key: any, value: any) {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return; // or return a placeholder, e.g., "[Circular]"
      }
      seen.add(value);
    }
    return value;
  }

  const seen = new Set();
  const jsonString = JSON.stringify(yourObject, replacer);
  seen.clear();
  return jsonString;
}
export default showMe;