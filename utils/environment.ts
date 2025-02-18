export class RestUtils {
  static fetch = async (uri: string, options: RequestInit | undefined) => {
    let url;
    options = options || {};
    options.headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    options.headers = {
      Authorization: 'Basic ' + btoa('admin:admin'),
      ...(options.headers || {}),
    };
    url = process.env.NEXT_PUBLIC_ETENDO_URL + uri;
    return fetch(url, options);
  };
}
