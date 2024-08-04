import axios from 'axios'

export const axiosInstance =axios.create({});

export const apiConnector = (method, url, bodyData, headers, params) => {
    return axiosInstance({
        method:`${method}`,
        url: `${url}`,
        data: bodyData ? bodyData :null,
        headers : headers ? headers: null,
        params: params ? params : null
    });
}
// backend se api call marne ke liye  apiconnector ka use kr rahe h 