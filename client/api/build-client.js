import axios from "axios";

const buildClient = ({req}) => {
    if (typeof window === 'undefined') {
        return axios.create({
            baseURL: 'http://www.freefly-app.com',
            headers: req.headers,
        });
    }
    return axios.create({
        baseURL: '/'
    })
};
export default buildClient