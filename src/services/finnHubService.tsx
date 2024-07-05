import axios from "axios";

const API_KEY = "cq2bhg9r01ql95nclsi0cq2bhg9r01ql95nclsig";
const BASE_URL = "https://finnhub.io/api/v1";

const finnhubService = {
  getQuote: (symbol: String) =>
    axios.get(`${BASE_URL}/quote?symbol=${symbol}&token=${API_KEY}`),
};

export default finnhubService;
