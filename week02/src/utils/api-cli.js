import axios from 'axios';
import readline from 'readline';

const apiUrl = 'http://127.0.0.1:3000';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

const makeRequest = async (url, method, data = {}) => {
  try {
    const response = await axios({
      method,
      url,
      data,
    });
    return response.data;
  } catch (error) {
    throw new Error(`API request failed: ${error.response?.data || error.message}`);
  }
};

const main = async () => {
  try {
    const resource = await askQuestion('What resource do you want to work with? (users or posts): ');
    const method = await askQuestion('What method do you want to work with? (DELETE, GET, PATCH, POST): ');

    switch (method.toUpperCase()) {
      case 'DELETE':
  const deleteId = await askQuestion('Enter the ID to delete: ');
  const trimmedDeleteId = deleteId.trim();
  try {
    const deleteResponse = await makeRequest(`${apiUrl}/${resource}/${trimmedDeleteId}`, 'DELETE');

    if (deleteResponse.status === 204) {
      console.log(`Resource with ID ${trimmedDeleteId} has been successfully deleted.`);
    } else if (deleteResponse.status === 403) {
      console.log(`Error deleting the resource with ID ${trimmedDeleteId}: Forbidden. You don't have sufficient permissions.`);
    } else if (deleteResponse.status === 405) {
      console.log(`Error deleting the resource with ID ${trimmedDeleteId}: Method Not Allowed. The API does not support the DELETE method for this resource.`);
    } else if (deleteResponse.status === 409) {
      console.log(`Error deleting the resource with ID ${trimmedDeleteId}: Conflict. The resource is in a conflicting state.`);
      console.log(`Please resolve the conflict with the API.`);
    } else if (deleteResponse.status === 404) {
      console.log(`Error deleting the resource with ID ${trimmedDeleteId}: Not Found. No resource found with the specified ID.`);
    } else {
      console.log(`Error deleting the resource with ID ${trimmedDeleteId}: Unexpected error occurred.`);
    }
  } catch (error) {
    console.log(`Error deleting the resource with ID ${trimmedDeleteId}: ${error}`);
  }
  break;

      case 'GET':
        const getAllOrById = await askQuestion('You choose GET. Do you want to make a GET All or GET By ID? (all/id): ');
        if (getAllOrById === 'all') {
          const getAllResponse = await makeRequest(`${apiUrl}/${resource}`, 'GET');
          console.log(getAllResponse);
        } else if (getAllOrById === 'id') {
          const id = await askQuestion('Enter the ID: ');
          const getByIdResponse = await makeRequest(`${apiUrl}/${resource}/${id}`, 'GET');
          console.log(getByIdResponse);
        } else {
          console.error('Invalid option selected.');
        }
        break;

      case 'PATCH':
        const patchFields = {};
        const patchFieldKeys = await askQuestion('Enter the field(s) to update (comma-separated): ');
        const patchFieldValues = await askQuestion('Enter the corresponding value(s) (comma-separated): ');
        const patchFieldKeysArr = patchFieldKeys.split(',');
        const patchFieldValuesArr = patchFieldValues.split(',');

        patchFieldKeysArr.forEach((key, index) => {
          patchFields[key.trim()] = patchFieldValuesArr[index].trim();
        });

        const patchResponse = await makeRequest(`${apiUrl}/${resource}`, 'PATCH', patchFields);
        console.log(patchResponse);
        break;

      case 'POST':
        if (resource.toLowerCase() === 'users') {
          const id = await askQuestion('User ID? ');
          const first_name = await askQuestion('User first_name? ');
          const last_name = await askQuestion('User last_name? ');
          const email = await askQuestion('User Email? ');
          const gender = await askQuestion('User Gender? ');

          const user = {
            id,
            first_name,
            last_name,
            email,
            gender,
          };

          const postResponseUser = await makeRequest(`${apiUrl}/${resource}`, 'POST', user);
          if (postResponseUser) {
            console.log('The new user was created successfully.');
            console.log('User data:', postResponseUser);
          } else {
            console.log('Error creating the new user.');
          }
        } else if (resource.toLowerCase() === 'posts') {
          const post_id = await askQuestion('post_id? ');
          const user_id = await askQuestion('user_id? ');
          const post_text = await askQuestion('post_text? ');
          const post_date = await askQuestion('post_date? ');
          const likes = await askQuestion('likes? ');
          const comments = await askQuestion('comments? ');
          const hashtags = await askQuestion('hashtags? ');
          const location = await askQuestion('location? ');
          const post_image = await askQuestion('post_image? ');

          const post = {
            post_id,
            user_id,
            post_text,
            post_date,
            likes,
            comments,
            hashtags,
            location,
            post_image,
          };

          const postResponsePost = await makeRequest(`${apiUrl}/${resource}`, 'POST', post);
          if (postResponsePost) {
            console.log('The new post was created successfully.');
            console.log('Post data:', postResponsePost);
          } else {
            console.log('Error creating the new post.');
          }
        } else {
          console.log('Invalid resource for POST request.');
        }
        break;

      default:
        console.log('Invalid method.');
        break;
    }
  } catch (error) {
    console.error(error.message);
  } finally {
    rl.close();
  }
};

main();
