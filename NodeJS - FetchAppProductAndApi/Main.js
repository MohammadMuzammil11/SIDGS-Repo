const axios = require('axios');
const { createObjectCsvWriter } = require('csv-writer');
var allApps = [];
let apigeeXManagementHost = "apigee.googleapis.com";
let orgName = "bdo-shared-np-x-ext";
let accessToken = "ya29.a0AcM612ziVjR1BeR2PY-SMs38L5UjidNM3aXt5GhwgYtQmnDeSqPcb43PasHF_JfoSFgTv_2waulnhdg1XbL4mFmOevjgBuAET1TmyL_Xw1tzO7ORW9GppQTs4VmGz4hRWZYiW9YbL-BFA6hzxP3dzvJvnDhvuWxgVeJHEIM6jbhXWkUWU_hiUuOs_qZrYEAIwvbR46UwTc1ww03oz0LD45xk7Exck86mhM4KIrP2xbbvRiDJ3N8r8mTU-Ju3iaIkkO7DFZE3xEvWU6aYpm81Gw2LYz_JNXuaPv7sFcZd-ZCFY1-b_elMnuPwoBmtTeOwSyTEDeYwkUiYiXXHjpfNg3_xdJIMwF3Ot5qrOIxFe-LWTUbN82ijydg_oQRQb6WG0nPF7PhHI2h05iRGEkdZ3G4JHhCubvdqoH2NXAaCgYKASMSARESFQHGX2MiR0P55MaQalFLXkcEwokyFA0429";

// Function to get the apps List
async function getAppsList() {
    const url = `https://${apigeeXManagementHost}/v1/organizations/${orgName}/apps`;
    const headers = { 'Authorization': `Bearer ${accessToken}` };
    const response = await axios.get(url, { headers });
    return response.data || [];
}

async function getAppProfileForId(appId) {
    const url = `https://${apigeeXManagementHost}/v1/organizations/${orgName}/apps/${appId}`;
    const headers = { 'Authorization': `Bearer ${accessToken}` };
    const response = await axios.get(url, { headers });
    let apiproductCreds = null;
    if(response.data.credentials){
        if(response.data.credentials.length > 2)  apiproductCreds = response.data.credentials[0].apiProducts.concat(response.data.credentials[1].apiProducts,response.data.credentials[2].apiProducts);
        else if(response.data.credentials.length > 1) apiproductCreds = response.data.credentials[0].apiProducts.concat(response.data.credentials[1].apiProducts);
        else apiproductCreds = response.data.credentials[0].apiProducts ?  response.data.credentials[0].apiProducts : null;  
    }
    console.log(response.data.name+" : "+apiproductCreds);
    let appResp = {'appName': response.data.name, 'apiProductsOfFirstCreds' : apiproductCreds };
    return appResp;
}

async function getApiProductDetails(apiproduct) {
    const url = `https://${apigeeXManagementHost}/v1/organizations/${orgName}/apiproducts/${apiproduct}`;
    const headers = { 'Authorization': `Bearer ${accessToken}` };
    const response = await axios.get(url, { headers });
    console.log(response.data.environments);
    return {
            'apiProducts' : response.data.operationGroup ? response.data.operationGroup.operationConfigs : null,
            'environments': response.data.environments ? response.data.environments : null
           };
}

// Write the collected data to a CSV file
async function saveToCsv(data, filename = `${orgName} - apps_info.csv`) {
    const csvWriter = createObjectCsvWriter({
        path: filename,
        header: [
            { id: 'App Name', title: 'App Name' },
            { id: 'API Product', title: 'API Product' },
            { id: 'Environments', title: 'Environments'},
            { id: 'API Proxy', title: 'API Proxy' }
        ]
    });
    await csvWriter.writeRecords(data);
    console.log(`Data saved to ${filename}`);
}

// Main function to run the script
async function main() {
    try {
        const allAppIds = await getAppsList();
        for (const app of allAppIds.app) {
            const appDetails = await getAppProfileForId(app.appId);
            if(appDetails.apiProductsOfFirstCreds){
                for (const apiProduct of appDetails.apiProductsOfFirstCreds){
                    if(apiProduct){
                        const apiProductsWithEnv = await getApiProductDetails(apiProduct.apiproduct);
                        if(apiProductsWithEnv.apiProducts){
                            for (const apis of apiProductsWithEnv.apiProducts){
                                allApps.push({
                                    'App Name': appDetails.appName,
                                    'API Product': apiProduct.apiproduct,
                                    'Environments': apiProductsWithEnv.environments ? apiProductsWithEnv.environments.toString() : null,
                                    'API Proxy' : apis.apiSource
                                });
                            }
                        }
                        else{
                            allApps.push({
                                'App Name': appDetails.appName,
                                'API Product': apiProduct.apiproduct,
                                'Environments': apiProductsWithEnv.environments ? apiProductsWithEnv.environments.toString() : null,
                                'API Proxy' : null
                            });
                        }
                    }
                    else{
                        allApps.push({
                            'App Name': appDetails.appName,
                            'API Product': null,
                            'Environments': null,
                            'API Proxy' : null
                        });
                    }

                }
            }
            else{
                allApps.push({
                    'App Name': appDetails.appName,
                    'API Product': null,
                    'Environments': null,
                    'API Proxy' : null
                });
            } 
        }
        await saveToCsv(allApps);
    } catch (error) {
        console.error('Error:', error);
    }
}
main()
