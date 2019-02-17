import axios from 'axios';

const instance  = axios.create({
    baseURL:'https://react-my-burger-1d1b1.firebaseio.com/'
});

export default instance;