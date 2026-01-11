import axios from "axios";

class Color {
    constructor() {
        this.BASE_URL = "https://inventorybackend-m1z8.onrender.com/api/v1/colors/get-colors"
    }
    async getColors() {
        try {
            const response = await axios.get(this.BASE_URL);
            return response.data;
        } catch (error) {
            console.log("Failed to fetch colors error :: ", error);
            throw Error(error);
        }
    }
}

const color = new Color();

export default color;