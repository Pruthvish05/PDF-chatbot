const API_BASE = "http://127.0.0.1:8000";

const SigmaAPI = {

    async uploadFile(file) {

        const formData = new FormData();

        formData.append("file", file);

        console.log(`Uploading: ${file.name}`);

        try {

            const response = await fetch(
                `${API_BASE}/upload`,
                {
                    method: "POST",
                    body: formData
                }
            );

            const data = await response.json();

            console.log("Upload Response:", data);

            return data;

        } catch (error) {

            console.error("Upload Error:", error);

            throw error;
        }
    },

    async queryDoc(filename, question) {

        console.log(`Querying ${filename}`);

        try {

            const response = await fetch(
                `${API_BASE}/query`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        filename,
                        question
                    })
                }
            );

            const data = await response.json();

            console.log("Query Response:", data);

            return data;

        } catch (error) {

            console.error("Query Error:", error);

            throw error;
        }
    }
};


const TokenManager = {

    getTokens() {
        return parseInt(
            localStorage.getItem("sigma_tokens") || "100"
        );
    },

    deduct(amount) {

        let current = this.getTokens();

        localStorage.setItem(
            "sigma_tokens",
            Math.max(0, current - amount)
        );

        window.dispatchEvent(
            new Event("tokenUpdate")
        );
    }
};