import axios from "axios";

class NocoDBService {
    constructor() {
        this.BASE_URL = "https://nocodb.qurvii.com/api/v2/tables/m5rt138j272atfc/records",
            this.ACCESS_TOKEN = "LsOnEY-1wS4Nqjz15D1_gxHu0pFVcmA_5LNqCAqK"
    }
    async getNocoDbRecords(order_id) {
        try {


            const options = {
                method: 'GET',
                url: 'https://nocodb.qurvii.com/api/v2/tables/m5rt138j272atfc/records',
                params: { offset: '0', limit: '25', where: `(order_id,eq,${Number(order_id)})`, viewId: 'vwi961elxbm8g0gr' },
                headers: {
                    'xc-token': this.ACCESS_TOKEN
                }
            };
            const response = await axios.request(options);
            return response.data.list?.[0] || {}

        } catch (error) {
            console.log("Failed to fetch order_id records error:: ", error);
            throw Error(error);
        }
    }
}

const nocoDBService = new NocoDBService();
export default nocoDBService;