$( function() {
    signIn();
});

function signIn() {
    $(`#enter`).on('click', async () => {

        let userName = $('#signup').val();
        let password = $('#pass').val();

        try {
            let result = await login(userName, password);
        } catch (error) {
            $(`#warning`).replaceWith(`<p class="has-text-centered has-text-danger"> Sign in didn't work, your password or username is not registered </p>`);
            return false;
        }
        
        
        window.location.replace("mainpage.html");
        return true;
    });

    $(`#new-guy`).on('click', () => {
        $(`#sign-in`).replaceWith(`
    
        <h1 class="title has-texted-centered">
        Account Creation
    </h1>
    <h2 class="subtitle">
        Be a little Mature about names here please.
    </h2>
    <hr class="login-hr">
    <form class="fillout box">
        <div class="field">
            <label class="label">UserId</label>
            <div class="control">
                <input id="id" class="input" type="text" placeholder="Custom Profile Id">
            </div>
        </div>

        <div class="field">
            <div class="control">
                <label class="label">User Name</label>
                <input id="name" class="input" type="text" placeholder="People will see this one">
            </div>
        </div>

        <div class="field">
            <div class="control">
                <label class="label">Password</label>
                <input id="pass" class="input" type="text" placeholder="Your new Passowrd">
            </div>
        </div>

        <div class="field">
            <div class="control">
                <label class="label">Avatar</label>
                <input id="avat" class="input" type="text" placeholder="120 character or less image link">
            </div>
        </div>
        <div class="field">
            <div class="control">
                <p id="warning" class="has-text-centered has-text-danger"></p>
            </div>
        </div>
        <div class="field is-grouped is-grouped-centered">
            <p class="control">
                <a id="start" class="button is-info">
                    Get Started
                </a>
            </p>
        </div>
    </form>`);
    
        $(`#start`).on('click', async () => {

            console.log($(`#id`).val());
            console.log($(`#name`).val());
            console.log($(`#pass`).val());
            console.log($(`#avat`).val());           

            try {
                let result = await register(`${$(`#id`).val()}`, `${$(`#name`).val()}`, `${$(`#pass`).val()}`, `${$(`#avat`).val()}`);
            } catch (error) {
                $(`#warning`).replaceWith(`<p class="has-text-centered has-text-danger"> Sign in didn't work, your password or username is not registered </p>`);
                return false;
            }

            window.location.replace("mainpage.html")
        });

    })
}

async function register(id, name, pass, avat) {
    const result = await axios.post('http://18.223.149.123:3030/register',
        {userId: id,
            displayName: name,
            password: pass,
            avatar: avat}, {withCredentials: true});
}

async function login(id, pass) {
    const result = await axios.post(`http://18.223.149.123:3030/login`,
        {
            userId: id,
            password: pass
        }
    );

    return result;

}
