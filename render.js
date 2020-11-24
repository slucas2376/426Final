
//Javascript function to render someone's profile. Needs all their information passed in to view.
function renderProfile(profile) {
    
}

//Javascript function to render the users own profile. Comes with edit buttons and the ability to manipulate your profile.
function renderUserProfile(user) {

}

// still trying to figure out exactly how to provide the "tweet" object. 
async function renderNewTweet() {
    let data = await recentTweets();

    for (let i = 0; i < data.length; i++ ) {
        if (data[i] != {}) {
            renderTweetBody(data[i]);
        }
    }
}

function renderTweetBody(data) {

    let user = getUser(data.userId);

    if(data.type == "tweet") {
        $(`.feed`).append(`
        <article class="media tweet-${data.id}">
            <div class="media-left"></div>
            <div class="box media-content">
              <article class="media">
                <figure class="media-left">
                  <p class="image is-64x64">
                    <img class="is-rounded" src="${user.avatar}">
                  </p>
                </figure>
                <div class="media-content">
                  <div class="content type-${data.userId}">
                    <p>
                      <strong>${user.displayName}</strong> <small>@${data.userId}</small>
                      <br>
                      ${data.body}
                    </p>
                  </div>
                  <div class="buttons">
                    <button class="button edit-${data.id} is-info is-small">Edit</button>
                    <button class="button retweet-${data.id} is-info is-small">  Retweet </button>
                    <button class="button reply-${data.id} is-info is-small">  Reply </button>
                    <button class="button delete-${data.id} is-danger is-small"> Delete </button>
                </div>
                </div>
              </article>
              
            </div>
            <div class="media-right">
              <button class="delete"></button>
            </div>
        </article>
        
        `);
    } else if (data.type == "retweet") {

    } else if (data.type == "reply") {

    }
}

$( async function () {
    await renderNewTweet();
});

function buttonSteup(data) {

}


async function logout() {
    const result = await axios.get(`https://comp426finalbackendactual2.herokuapp.com/logout`, {withCredentials: true});
}

async function getUser(id) {
    const result = await axios.get(`https://comp426finalbackendactual2.herokuapp.com/users/${id}`,
    {}, {withCredentials: true});

    return result;
}

async function deleteUser(id) {
    const result = await axios.delete(`https://comp426finalbackendactual2.herokuapp.com/users/${id}`, {withCredentials: true});
}

async function editUser(id, name, pass, avat, descript) {
    const result = await axios.put(`https://comp426finalbackendactual2.herokuapp.com/users/${id}`, {displayName: name,
    password: pass,
    avatar: avat,
    profileDescription: descript}, {withCredentials: true});
}

async function like(id) {
    const result = await axios.post(`https://comp426finalbackendactual2.herokuapp.com/tweets/${id}/like`, {withCredentials: true});
    return result;
}

async function tweet(text) {
    const result = await axios.post(`https://comp426finalbackendactual2.herokuapp.com/tweets`, {type: "tweet", body: text}, {withCredentials: true});
    return result;
}

async function retweet(id, text) {
    const result = await axios.post(`https://comp426finalbackendactual2.herokuapp.com/tweets`, {type: "retweet", body: text, parentId: id}, {withCredentials: true});
    return result;
}

async function reply(id, text) {
    const result = await axios.post(`https://comp426finalbackendactual2.herokuapp.com/tweets`, {type: "reply", body: text, parentId: id}, {withCredentials: true});
    return result;
}

async function edit(id, replacement) {
    const result = await axios.put(`https://comp426finalbackendactual2.herokuapp.com/tweets/${id}`, {body: `${replacement}`}, {withCredentials: true});
}

async function deleteTweet(id) {
    const result = await axios.delete(`https://comp426finalbackendactual2.herokuapp.com/tweets/recent/tweets/${id}`, {withCredentials: true});
}

async function recentTweets(){
    const result = await axios.get('https://comp426finalbackendactual2.herokuapp.com/tweets/recent', {limit: "75", skip: "0"}, {withCredentials: true});
    return result;
}
