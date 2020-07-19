import {AxiosInstance} from 'axios';

interface Headers {
  [key: string]: any;
}

interface HttpOptionsService {
  getHttpOptions(): { headers?: Headers };
}

export class DefaultHttpRequest {
  constructor(private axios: AxiosInstance, private httpOptionsService: HttpOptionsService) {}
  private getHttpOptions(): { headers?: Headers } {
    if (this.httpOptionsService) {
      return this.httpOptionsService.getHttpOptions();
    } else {
      const httpOptions = {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        }
      };
      return httpOptions;
    }
  }

  get<T>(url: string, options?: {headers?: Headers}): Promise<T> {
    return Promise.resolve(
      this.axios.get<T>(url, options ? options : this.getHttpOptions())
      .then(({data}) => data)
      .catch(({data}) => { throw data; })
    );
  }

  delete<T>(url: string, options?: {headers?: Headers}): Promise<T> {
    return Promise.resolve(
      this.axios.delete(url, options ? options : this.getHttpOptions())
      .then(({data}) => data)
      .catch(({data}) => { throw data; })
    );
  }

  post<T>(url: string, obj: any, options?: {headers?: Headers}): Promise<T> {
    return Promise.resolve(
      this.axios.post(url, obj, options ? options : this.getHttpOptions())
      .then(({data}) => data)
      .catch(({data}) => { throw data; })
    );
  }

  put<T>(url: string, obj: any, options?: {headers?: Headers}): Promise<T> {
    return Promise.resolve(
      this.axios.put(url, obj, options ? options : this.getHttpOptions())
      .then(({data}) => data)
      .catch(({data}) => { throw data; })
    );
  }

  patch<T>(url: string, obj: any, options?: {headers?: Headers}): Promise<T> {
    return Promise.resolve(
      this.axios.patch<T>(url, obj, options ? options : this.getHttpOptions())
      .then(({data}) => data)
      .catch(({data}) => { throw data; })
    );
  }
}
