const axios = require('axios');
const { createObjectCsvWriter } = require('csv-writer');
 
const orgName = 'bdo-unibank';
const accessToken = 'bW9oYW1tYWRtQHNpZGdzLmNvbTpNdXphbW1pbDc4NkA=';
 
// Function to get the list of developers
async function getDevelopers() {
    const url = `https://api.enterprise.apigee.com/v1/organizations/${orgName}/developers`;
    const headers = { 'Authorization': `Basic ${accessToken}` };
    const response = await axios.get(url, { headers });
    console.log(response.data);
    // return ['dusan@backbase.com'];
    return response.data || [];
}
 
// Function to get the apps for a specific developer
async function getAppsForDeveloper(developerEmail) {
    const url = `https://api.enterprise.apigee.com/v1/organizations/${orgName}/developers/${developerEmail}/apps`;
    const headers = { 'Authorization': `Basic ${accessToken}` };
    const response = await axios.get(url, { headers });
    console.log(response.data);
    return response.data || [];
}

async function getAppsIdForDeveloperApps(appName,developerEmail) {
    const url = `https://api.enterprise.apigee.com/v1/organizations/${orgName}/developers/${developerEmail}/apps/${appName}`;
    const headers = { 'Authorization': `Basic ${accessToken}` };
    let response = undefined;
    try{
         response =  await axios.get(url, { headers });
    }catch (error) {
        console.error('Error:', error);
    }
    // console.log(response.data.apps);
    return response ? response.data : [];
}
// Collect app information
async function collectAppsInfo() {
    console.log('collectAppsInfo');
    const developers = await getDevelopers();
    const allApps = [];
 
    for (const developer of developers) {
        console.log(developer);
        const developerEmail = developer;
        const appName = await getAppsForDeveloper(developerEmail);
        // console.log(appName);
        
        // console.log(appWithAppId);
        // console.log(apps);
        for (const app of appName) {
            const appWithAppId = await getAppsIdForDeveloperApps(app,developerEmail);
            allApps.push({
                'App ID': appWithAppId.appId,
                'App Name': app,
                'Developer ID': developerEmail
            });
        }
    }
 
    return allApps;
}
 
// Write the collected data to a CSV file
async function saveToCsv(data, filename = 'apps_info.csv') {
    const csvWriter = createObjectCsvWriter({
        path: filename,
        header: [
            { id: 'App ID', title: 'App ID' },
            { id: 'App Name', title: 'App Name' },
            { id: 'Developer ID', title: 'Developer ID' }
        ]
    });
    await csvWriter.writeRecords(data);
    console.log(`Data saved to ${filename}`);
}
 
// Main function to run the script
async function main() {
    try {
        const allApps = await collectAppsInfo();
        await saveToCsv(allApps);
    } catch (error) {
        console.error('Error:', error);
    }
}
main();