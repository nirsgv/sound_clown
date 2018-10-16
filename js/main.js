"use strict";
const model = {
    currentTrackId: '',
    batchDisplay: 200,
    renderedTracksBatch: 0,
    lastSearchedStrings: [],
    currentResults: [],

    getTracks: (par) => {
        return SC.get('/tracks', {
            limit: model.batchDisplay,
            q: par
        }).then(function (tracks) {
            model.currentResults = tracks;
            console.log(model.currentResults);
            // view.printCurrentResults(model.currentResults);
            // pass lastSearchedStrings to view to render 'search_display' li's (last searches)
            return Promise.resolve(tracks);
        });
    },
};



const view = {
    defaultImg: "assets/img/soundcloud-logo.jpg",
    dataDisplay:  document.querySelector("#data_display"),
    searchDisplay:  document.querySelector("#search_display"),
    searchGetInput: document.querySelector("#search_get_input"),
    searchSubmitter: document.querySelector('#search_submitter'),
    imageHolder: document.querySelector('#image-holder'),

    // the elements with 'data-tab-id' attribute
    tab_lis: document.querySelectorAll('[data-tab-id]'),
    init: () => {
        // set event handlers
        //controller.searchSubmitter.onclick = controller.commitSearch;
        view.searchSubmitter.addEventListener('click', controller.commitSearch);
        view.searchGetInput.addEventListener('change', controller.commitSearch);
        view.imageHolder.addEventListener('click', controller.playTrack);

        // the elements with corresponding ids
        const tabs = Array.from(view.tab_lis)
            .map(t=>document.getElementById(t.getAttribute('data-tab-id')));
        view.tab_lis.forEach((li, i)=> {
            li.addEventListener('click', ()=> {
                tabs.forEach(t => t.classList.remove('displayed'));
                tabs[i].classList.add('displayed');
            })
        });
    },

    printCurrentResults: (tracks) => {
        console.table(tracks);
        view.dataDisplay.innerHTML = tracks
            .map(t =>
                `<li class="data-display__result" track-id="${t.id}" onclick="controller.loadTrack(${t.id},'${t.artwork_url || view.defaultImg}')">
                    <span class="data-display__link">${t.title}</span>
                </li>`).join('');
    },

    printLastResults: (lastSearchesList) => {
        console.log(lastSearchesList);
        view.searchDisplay.innerHTML = lastSearchesList
            .map((searchString, index, array) =>
                `<li class="search-display__result">
                    <span class="search-display__link">${searchString}</span>
                </li>`).join('');
    }
};

const controller = {
    scIFrame: document.querySelector('#sc-player'),
    trackImage: document.querySelector('img#track-image'),
    user_id: 'E8IqLGTYxHll6SyaM7LKrMzKveWkcrjg',
    init: () => {
        SC.initialize({client_id: controller.user_id});
        controller.scPlayer = SC.Widget(controller.scIFrame);
        // console.log(controller);
    },
    commitSearch:
        () => {
            const searchValue = view.searchGetInput.value;
            console.log(searchValue);
            model.getTracks(searchValue).then(view.printCurrentResults);
            controller.addSearchToList(searchValue);
        },
    addSearchToList:
        (searchValue) => {
        // check for duplicates before adding to list
            if(model.lastSearchedStrings.indexOf(searchValue) ===  -1){
                model.lastSearchedStrings.push(searchValue);
            }
            view.printLastResults(model.lastSearchedStrings);
        },
    loadTrack:
        (id,imageSrc) => {
            model.currentTrackId = id;
            controller.scIFrame.src = `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${id}&auto_play=false`;
            controller.trackImage.src = imageSrc;
        },
    playTrack:
        () => {
            controller.scPlayer.play();
    }
};

document.addEventListener("DOMContentLoaded", view.init);
document.addEventListener("DOMContentLoaded", controller.init);

