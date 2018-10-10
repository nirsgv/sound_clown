"use strict";

const model = {
    currentTrackId: '',
    batchDisplay: 6,
    lastSearchedStrings: [],
    currentResults: [],
    getTracks: (par) => {
        SC.get('/tracks', {
            limit: model.batchDisplay,
            q: par
        }).then(function (tracks) {
            model.currentResults = tracks;
            console.log(model.currentResults);
            view.printCurrentResults(model.currentResults);
        });
    },
};

const view = {
    printCurrentResults: (tracks) => {
        let dataDisplay = document.querySelector("#data_display");
        console.log(tracks);
        tracks.forEach((layer,index,array) => {
            let track = document.createElement('li');
            let trackLink = document.createElement('a');
            track.classList.add('data-display__result');
            trackLink.classList.add('data-display__link');
            trackLink.setAttribute('track-id',layer.id);
            trackLink.innerText = layer.title;
            track.appendChild(trackLink);
            dataDisplay.appendChild(track);
        });
    }
};

const controller = {

    searchGetInput: document.querySelector("#search_get_input"),
    searchSubmitter: document.querySelector('#search_submitter'),
    user_id: 'EBquMMXE2x5ZxNs9UElOfb4HbvZK95rc',
    init: () => {
        SC.initialize({client_id: controller.user_id});
        // console.log(controller);

        // set event handlers
        controller.searchSubmitter.onclick = controller.commitSearch;
        controller.searchSubmitter.onclick = controller.commitSearch;
    },
    commitSearch:
        () => {
            let searchValue = controller.searchGetInput.value;
            console.log(searchValue);
            model.getTracks(searchValue);
        }
};

document.addEventListener("DOMContentLoaded", controller.init);

