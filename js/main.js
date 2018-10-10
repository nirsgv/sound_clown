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
        console.log(dataDisplay,tracks);
        const builtSearchResultsElements = tracks.map((layer,index,array) => {
            let track = document.createElement('li');
            track.classList.add('track');
            track.setAttribute('track-id',layer.id);
            track.innerText = layer.title;
            return (track)
        });
        console.log(builtSearchResultsElements);

        //document.getElementById('app').appendChild(resultsContainer);
        // if (songs.length > 0) {
        //     for (let i = 0; i < songs.length; i++) {
        //         let result = document.createElement('results__item');
        //         result.setAttribute('data-id', i + 1);
        //         resultsContainer.appendChild(result);
        //         result.innerText = songs[i].title;
        //     }
        // } else {
        //     let message = document.createElement('message');
        //     resultsContainer.appendChild(message);
        //     message.innerText = "shit face";
        // }
    }
};

const controller = {

    searchGetInput: document.querySelector("#search_get_input"),
    searchSubmitter: document.querySelector('#search_submitter'),
    user_id: 'EBquMMXE2x5ZxNs9UElOfb4HbvZK95rc',
    init: () => {
        SC.initialize({client_id: controller.user_id});
        console.log(controller);

        // set event handlers
        controller.searchSubmitter.onclick = controller.commitSearch;
        controller.searchSubmitter.onclick = controller.commitSearch;
    },
    commitSearch:
        () => {
            let searchValue = controller.searchGetInput.value;
            console.log(searchValue);
            model.getTracks(searchValue);
            // if (model.searchState === false) {
            //     if (searchValue) {
            //         model.getSongs(searchValue);
            //     }
            // } else {
            //     controller.searchGetInput.value = "";
            //     model.searchState = false;
            //     console.log(model.searchState, "changed state, cleared value");
            // }
        }
};

document.addEventListener("DOMContentLoaded", controller.init);

