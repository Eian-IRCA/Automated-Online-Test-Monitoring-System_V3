
**Setup Instructions**

### Prerequisites
- Node.js and Yarn installed
- Python and Flask installed
- SendGrid account and API key

### Installation
1. Clone the repository:
    ```bash
    git clone /home/fefe/home/canada/software_engi/test/Automated-Online-Test-Monitoring-System_V3
    cd Automated-Online-Test-Monitoring-System_V3
    ```

2. Install the required Node.js modules:
    ```bash
    yarn install
    ```

3. Install the required Python modules:
    ```bash
    pip install -r requirements.txt
    ```

### Configuration
- Set up your SendGrid API key in the `server.py` file:
    ```python
    SENDGRID_API_KEY = 'your_sendgrid_api_key'
    ```

- Update the email addresses in the `btn-handler.jsx` file if necessary.

### Running the Application 
1. Start the Flask server:
    ```bash
    python server.py
    ```

2. In another terminal, start the development server:
    ```bash
    yarn start
    ```

### Usage
1. Open your browser and navigate to `http://localhost:3000`.
2. Follow the instructions to start a session.
3. Enter the required email addresses and start the session.
4. Once the session ends, the results will be sent to the specified control email.

### Building for Production
To build the application for production, run:
```bash
yarn build
```
This will create an optimized build of the application in the `build` directory.

### Troubleshooting
If you encounter any issues, please check the following:
- Ensure all dependencies are installed.
- Verify that the SendGrid API key is correctly set.
- Check the browser console and server logs for error messages.

For further assistance, please refer to the documentation or open an issue on GitHub.