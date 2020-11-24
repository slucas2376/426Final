

//Javascript function to render someone's profile. Needs all their information passed in to view.
function renderProfile(profile) {
    
}

//Javascript function to render the users own profile. Comes with edit buttons and the ability to manipulate your profile.
function renderUserProfile(user) {

}

// still trying to figure out exactly how to provide the "tweet" object. 
async function renderNewTweet() {
    let data = await recentTweets();
    console.log(data.length);

    for (let i = 0; i < data.length; i++ ) {
        if (data[i] != {}) {
            renderTweetBody(data[i]);
        }
    }
}

async function renderTweetBody(data) {

    let user = await getUser(data.userId);

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
                    <p class>
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

        let parent = await getTweet(data.parentId);
        let userParent = await getUser(parent.userId);


        $(`.feed`).append(`
        <br>
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
                      <p class>
                        <strong>${user.displayName}</strong> <small>@${data.userId}</small>
                        ${data.body}
                        <br>
                        <article class="media">
                          <figure class="media-left">
                            <p class="image is-64x64">
                              <img class="is-rounded" src="${userParent.avatar}">
                            </p>
                          </figure>
                          <div class="media-content">
                            <div class="content type-${parent.userId}">
                              <p class>
                                <strong>${userParent.displayName}</strong> <small>@${userParent.userId}</small>
                                <br>
                                ${parent.body}
                              </p>
                            </div>
                          </div>
                        </article>
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
    }
}

async function renderMainFeed() {
    $(`.columns`).append(`
        <div class="column mainfeed">
            <div class="title has-text-centered">
              Whats Happening!
            </div>
            <div class="box has-background-info feed">
            
            </div>
        </div>
    `)
    await renderNewTweet();
}

function buttonSteup(data) {

}

$( async function () {
    await renderMainFeed();
});


async function getTweet(id) {
    const result = await axios.get(`https://comp426finalbackendactual2.herokuapp.com/tweets/${id}`, {"id": id}, {withCredentials: true})
    return result.data;
}

async function logout() {
    const result = await axios.get(`https://comp426finalbackendactual2.herokuapp.com/logout`, {withCredentials: true});
}

async function getUser(id) {
    const result = await axios.get(`https://comp426finalbackendactual2.herokuapp.com/users/${id}`,
    {}, {withCredentials: true});

    return result.data;
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
    const result = await axios.get('https://comp426finalbackendactual2.herokuapp.com/tweets/recent', {withCredentials: true});
    return result.data;
}
