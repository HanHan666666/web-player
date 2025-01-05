import axios from 'axios'

// 接口地址前缀
const baseURL = import.meta.env.VITE_API_BASE_URL

/**
 * @description: request method
 */
export enum RequestEnum {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
}

/**
 * @description:  contentType
 */
export enum ContentTypeEnum {
    // json
    JSON = 'application/json;charset=UTF-8',
    // form-data qs
    FORM_URLENCODED = 'application/x-www-form-urlencoded;charset=UTF-8',
    // form-data  upload
    FORM_DATA = 'multipart/form-data;charset=UTF-8',
}

const instance = axios.create({
    timeout: 60 * 1000, // 1分钟
    headers: {'Content-Type': ContentTypeEnum.JSON}
})

/**
 * @params method: 请求方式
 * @params url: 请求的url
 * @params params: 请求携带参数
 * @params optionConfig: 自定义参数，例如请求头添加数据
 *
 */
export function request(method: RequestEnum, url: string, params: any, optionConfig = {}):Promise<any> {
    let result = {}
    if (Object.prototype.toString.call(params) === '[object Object]') {
        for (let [key, value] of Object.entries(params)) {
            result[key] = typeof value === 'string' ? value.trim() : value
        }
    } else {
        result = params
    }
    let methodToUpperCase = method.toUpperCase()
    let defaultConfig = {
        method: methodToUpperCase,
        url: url.includes('http') ? url : baseURL + url,
        params: methodToUpperCase === RequestEnum.GET ? result : null,
        data: methodToUpperCase === RequestEnum.POST ? result : null,
        paramsSerializer: {
            indexes: null
        }
    }
    let requestConfig = Object.assign({}, defaultConfig, optionConfig)
    return new Promise((resolve, reject) => {
        instance(requestConfig)
            .then((response) => {
                resolve(response.data)
            })
            .catch((error) => {
                reject(error)
            })
    })
}
