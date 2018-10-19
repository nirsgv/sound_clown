"use strict";

//todo: divide loadTrack into load image src and load url
//todo: put all global variables into an IIFE

const model = {
    currentTrackId: '',
    initialBatch: 200,
    lastSearchedStrings: [],
    currentResults: [],
    batchSlice: 6,
    currentPagination: 0,
    paginationActivated: false,
    initiallySetSerchesFromLocalStorage: false,
    log: ['a', 'b', 'c'],
    // get lastSearchedStrings() {
    //     if (localStorage.getItem('lastSearched')) {
    //         model.initiallySetSerchesFromLocalStorage = true;
    //         return localStorage.getItem('lastSearched').split(',');
    //     }
    //     return ['asd'];
    // },
    getTracks: (par) => {
        return SC.get('/tracks', {
            limit: model.initialBatch,
            q: par
        }).then(function (tracks) {
            model.currentResults = tracks;
            //console.log(model.currentResults);
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
    prevPaginate: document.querySelector('#prev'),
    nextPaginate: document.querySelector('#next'),
    inputMessage: document.querySelector('#input_message'),
    // the elements with 'data-tab-id' attribute
    tab_lis: document.querySelectorAll('[data-tab-id]'),
    init: () => {
        // set event handlers
        view.searchSubmitter.addEventListener('click', controller.commitSearch);
        view.searchGetInput.addEventListener('change', controller.commitSearch);
        view.imageHolder.addEventListener('click', controller.playTrack);
        view.prevPaginate.addEventListener('click', view.paginate);
        view.nextPaginate.addEventListener('click', view.paginate);

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
    /**
     * Slices a delivered collection by current pagination value and batch amount.
     * @param {array} items - A collection of tracks data items.
     */
    paginateResults: (items) => {
        const paginatedPos = model.currentPagination * model.batchSlice;
        return items.slice(paginatedPos, paginatedPos + model.batchSlice)
    },
    /**
     * Goes through the sliced amount by pagination of searched tracks,
     * builds list elements for the DOM and appends them.
     * @param {array} tracks - A collection of tracks data items.
     */
    printCurrentResults: (tracks) => {
        //console.table(tracks);
        view.dataDisplay.innerHTML = view.paginateResults(tracks)
            .map(t =>
                `<li class="data-display__result" track-id="${t.id}" onclick="controller.loadTrack(${t.id},'${t.artwork_url || view.defaultImg}')">
                    <span class="data-display__link">${t.title}</span>
                </li>`).join('');
        view.setPaginationUI();
    },

    printLastSearches: (lastSearchesList) => {
        console.log(lastSearchesList);
        view.searchDisplay.innerHTML = lastSearchesList
            .map((searchString, index, array) =>
                // todo: print the parameter as the argument for function
                `<li class="search-display__result" searchPar="${searchString}" onclick="controller.commitSearchByLastSearchResult('aphex twin')">
                    <span class="search-display__link">${searchString}</span>
                </li>`).join('');
    },
    setPaginationUI: () => {
        console.log('setPaginationUI started');
        if (model.currentResults.length < model.batchSlice){
            view.prevPaginate.setAttribute('disabled', '');
            view.nextPaginate.setAttribute('disabled', '');
        }
    },
    paginate: (e) => {
        console.dir(e.target.id);
        e.target.id==='next' ? model.currentPagination++ : model.currentPagination > 0  ? model.currentPagination-- : '';
        view.printCurrentResults(model.currentResults);
        console.log(model.currentPagination);
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
            //console.log(searchValue);
            if (searchValue !== '') {
                model.getTracks(searchValue).then(view.printCurrentResults);
                controller.addSearchToList(searchValue);
                view.inputMessage.setAttribute('visible','false');
            } else {
                view.inputMessage.setAttribute('visible','true');
            }
        },
    commitSearchByLastSearchResult:
        (searchString) => {
            //console.log(searchValue);
                model.getTracks(searchString).then(view.printCurrentResults);
        },
    /**
     * Checks if searched value is present in an array which holds searched titles,
     * if not present in array already, it adds it.
     * @param {string} searchValue - Name of search title.
     */
    addSearchToList:
        (searchValue) => {
        // check for duplicates before adding to list
            if(model.lastSearchedStrings.indexOf(searchValue) ===  -1){
                model.lastSearchedStrings.push(searchValue);
            }
            console.log(Array.isArray(model.lastSearchedStrings));
            window.localStorage.setItem('lastSearched', model.lastSearchedStrings);
            view.printLastSearches(model.lastSearchedStrings);
        },
    loadTrack:
        (id,imageSrc) => {
            model.currentTrackId = id;
            controller.trackImage.src = imageSrc;
        },
    playTrack:
        () => {
            // let isSet= false;
            // let promiseToLoadNewTrackInPlayer = new Promise(function(resolve,reject){
            //     resolve(controller.scIFrame.src = `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${model.currentTrackId}&auto_play=false`);
            //
            // });
            // promiseToLoadNewTrackInPlayer().then(controller.scPlayer.play());
            // todo: change this setTimeout with a nice promise
            controller.scIFrame.src = `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${model.currentTrackId}&auto_play=false`;
            window.setTimeout(function(){controller.scPlayer.play();},1000);
    }
};

//document.addEventListener("DOMContentLoaded", function(){model.lastSearchedStrings=['asd'];view.printLastSearches(model.lastSearchedStrings)});
document.addEventListener("DOMContentLoaded", view.init);
document.addEventListener("DOMContentLoaded", controller.init);

