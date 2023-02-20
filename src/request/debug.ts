import request from "./index"

const fetchApi = (url: string, options: any) => {
  return request.post(url, { data: {} })
}

const handle = () => {
  fetchApi('', {}).setConfig({}).then((res) => {
    console.log(res);
  })
}
