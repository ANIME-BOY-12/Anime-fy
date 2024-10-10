console.log("It's started")

let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds)|| seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds =Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2 ,'0');
    const formattedSeconds = String(remainingSeconds).padStart(2 ,'0');
    return `${formattedMinutes}/${formattedSeconds}`;
} 

async function getsongs(folder){
    currFolder=folder
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a") ;

    // console.log(as)
    songs =[]
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".m4a")){
            songs.push(element.href.split(`${folder}`)[1])
        }
    }

    let songUL = document.querySelector(".unorderList"); //.getElementsByTagName("ul")[0]
    songUL.innerHTML =""
    // console.log(songs)
    for(const song of songs){
        songUL.innerHTML = songUL.innerHTML + `
        <li>
            <img src="./images/music.svg" alt="" class="invert">
            <div class="info">
                <p>${song}</p>F
                <p>ANIME WORLD</p>
            </div>
            <div class="playBtn">
                <img src="./images/play.svg" alt="" class="invert">
            </div>
        </li>
        `; 
    }

    //attach event listner to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click" , element=>{
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs
}

const playMusic = (track ,pause=false)=> {
    // let audio = new Audio("/songs/" + track)
    currentSong.src = `${currFolder}` + track
    if(!pause){
        currentSong.play();
        play.src = "./images/pause.svg"
    }
    document.querySelector(".songInfo").innerHTML =track;
    document.querySelector(".songTime").innerHTML ="00:00 / 00:00";
}

async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardcontainer = document.querySelector(".cardcontainer")
    
    let array = Array.from(anchors)
        for(let index = 0; index < array.length; index++){
            const e = array[index];
        
        if(e.href.includes("songs/")){
            // console.log(e.href)
            let folder = e.href.split("/").slice(-1)[0]
            // console.log(folder)
            //get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response = await a.json();
            // console.log(response);
            
            cardcontainer.innerHTML = cardcontainer.innerHTML + `
            <div data-folder="${folder}" class="card">
                <div class="plays">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="60" height="50">
                        <circle cx="50" cy="50" r="50" fill="#1fdf64" />
                        <polygon points="30,20 30,80 80,50" fill="black" />
                    </svg>
                </div>
                <img src="/songs/${folder}/cover.png" alt="">
                <h3>${response.title}</h3>
                <p>${response.description}<p>
            </div>
            `
            // console.log(cardcontainer)
        }
    }
    // to load playlist when click 
    Array.from(document.getElementsByClassName("card")).forEach(e =>{
        e.addEventListener("click" ,async item=>{
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0])
        })
    })
}
async function main(){


    //get the list of song
    await getsongs("songs/anime-anime");
    playMusic(songs[0] , true)

    //display all the albums on the page
    displayAlbums();

    //attach event listener to play buttons
    play.addEventListener("click" , ()=>{
        if(currentSong.paused){
            currentSong.play()
            play.src = "./images/pause.svg"
        }
        else{
            currentSong.pause()
            play.src = "./images/play.svg"
        }
    })

    //time update event
    currentSong.addEventListener("timeupdate" , ()=>{
        // console.log(currentSong.currentTime , currentSong.duration) ;
        document.querySelector(".songTime").innerHTML = `
        ${secondsToMinutesSeconds(currentSong.currentTime)} : ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration)*100 + "%"
    })   

    //add aevent listener to seek bar
    document.querySelector(".seekbar").addEventListener("click" , e=> {
        let percent = ( e.offsetX/e.target.getBoundingClientRect().width)*100;
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = currentSong.duration*percent / 100
    })

    //evet listener for hamburger and close button
    document.querySelector(".hamburger").addEventListener("click" , ()=>{
        document.querySelector(".left").style.left ="0"
    })
    document.querySelector(".close").addEventListener("click" , ()=>{
        document.querySelector(".left").style.left ="-120%"
    })
    

    //event listener to prev and next
    previous.addEventListener("click" , ()=>{
        console.log("previous clicked");

        let index=songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        // console.log(songs , index)
        if((index-1) >= 0){
            playMusic(songs[index-1])
        }
    })
    next.addEventListener("click" , ()=>{
        console.log("next clicked");

        let index=songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if((index+1) < songs.length){
            playMusic(songs[index+1])
        }
    })

    //to change volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change" , (e)=>{
        currentSong.volume = parseInt(e.target.value) / 100
    })


    // add event listener to mute the track  
    document.querySelector(".volume>img").addEventListener("click" , e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src=e.target.src.replace("volume.svg","mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src=e.target.src.replace("mute.svg" ,"volume.svg")
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })
    
}

main()