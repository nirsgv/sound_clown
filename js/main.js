"use strict";
//todo: divide loadTrack into load image src and load url
//todo: put all global variables into an IIFE
//todo: pagination end and pagination disabled handling
//todo: play button rendering handling
// function Model() {
//
//
//     return {
//
//     }   ;
// }
// //const model = new Model();
//
// const model = (function (){
//     // private
//     return {};
// })();

const Model = function(){
    this.currentTrackId = '';
    this.lastSearchedStrings = [];
    this.currentResults = [];
    this.batchSlice = 6;
    this.lastSearchesBatchSlice = 5;
    this.LAST_SEARCHED = 'sound_clown.lastSearched';
    this.nextHref = '';
    this.user_id = 'E8IqLGTYxHll6SyaM7LKrMzKveWkcrjg';
    this.init = () => {
        this.lastSearchedStrings = localStorage.getItem(this.LAST_SEARCHED)
                                  ? localStorage.getItem(this.LAST_SEARCHED).split(',')
                                  : [];
    }
};

const View = function(model){
    this.defaultImg = "assets/img/soundcloud-logo.jpg";
    this.dataDisplay =  document.getElementById("data_display");
    this.searchDisplay =  document.getElementById("search_display");
    this.searchGetInput = document.getElementById("search_get_input");
    this.searchSubmitter = document.getElementById('search_submitter');
    this.imageHolder = document.getElementById('image-holder');
    this.inputMessage = document.getElementById('input_message');
    this.dataDisplayHeader = document.getElementById('data_display_header');
    this.searchDisplayHeader = document.getElementById('search_display_header');
    this.nextHrefButton =  document.getElementById("fetch_next");
    this.tab_lis = document.querySelectorAll('[data-tab-id]');
    this.scIFrame = document.getElementById('sc-player');
    this.trackImage = document.querySelector('img#track-image');
    this.playChosen = document.querySelector('.play-chosen');
    this.soundCloudStrip = document.querySelector('.soundcloud-strip');

    this.init = () => {
        // set event handlers
        this.searchSubmitter.addEventListener('click', controller.commitSearch,false);
        this.searchGetInput.addEventListener('change', controller.commitSearch,false);
        this.dataDisplayHeader.addEventListener('click', this.toggleHeaderActive,false);
        this.searchDisplayHeader.addEventListener('click', this.toggleHeaderActive,false);
        this.nextHrefButton.addEventListener('click',controller.getNextBatch,false);
        this.printLastSearches(model.lastSearchedStrings);

        // the elements with corresponding ids
        const tabs = Array.from(view.tab_lis)
            .map(t=>document.getElementById(t.getAttribute('data-tab-id')));
                view.tab_lis.forEach((li, i)=> {
                li.addEventListener('click', ()=> {
                    tabs.forEach(t => t.classList.remove('displayed'));
                    tabs[i].classList.add('displayed');
            },false)
        });
    },
    this.getCenter = (elem) => {
        const elemBoundRect = elem.getBoundingClientRect();
        const horCenter = elemBoundRect.left + (elemBoundRect.width/2);
        const verCenter = elemBoundRect.top + (elemBoundRect.height/2);
        return [horCenter,verCenter];
    },

    this.getOffset = (elem) => {
        const elemBoundRect = elem.getBoundingClientRect();
        const horOffset = elemBoundRect.left;
        const verOffset = elemBoundRect.top;
        return [horOffset,verOffset];
    },

    this.isElemWideOrTall = (elem) => {
        const height = elem.naturalHeight;
        const width = elem.naturalWidth;
        return height > width ? '' : 'portrait-like';
    },

    this.toggleHeaderActive = (event) => {
        if (event.target.id==="search_display_header"){
            view.dataDisplayHeader.classList.remove('active');
            view.searchDisplayHeader.classList.add('active');
        } else {
            view.searchDisplayHeader.classList.remove('active');
            view.dataDisplayHeader.classList.add('active');
        }
    },

    /**
     * Goes through the sliced amount by pagination of searched tracks,
     * builds list elements for the DOM and appends them.
     * @param {array} tracks - A collection of tracks data items.
     */
    this.printCurrentResults = (tracks) => {
        view.dataDisplay.innerHTML =
            tracks.map(t =>
                `<li class="data-display__result" track-id="${t.id}" onclick="view.animateClonedIntoDestination(event,view.imageHolder,${t.id});">
                    <span class="data-display__link">${t.title}</span>
                </li>`).join('');
    },

    this.printLastSearches = (lastSearchesList) => {
        view.searchDisplay.innerHTML = lastSearchesList
            .map((searchString, index, array) =>
                // todo: print the parameter as the argument for function
                `<li class="search-display__result" searchPar="${searchString}" onclick="controller.commitSearchByLastSearchResult('${searchString}');view.toggleHeaderActive(event)">
                    <span class="search-display__link">${searchString}</span>
                </li>`).join('');
    },

    this.animateClonedIntoDestination = (event,destinationElem,id) => {
        const startPosition = view.getOffset(event.target),
              destination = view.getCenter(destinationElem),
              clonedElemNode = event.target.cloneNode(true),
              uniqueId=Math.random().toFixed(6);
        clonedElemNode.classList.add('animated-cloned-element');
        clonedElemNode.setAttribute('id',uniqueId);
        clonedElemNode.setAttribute('style', `position:fixed;left:${startPosition[0]}px;top:${startPosition[1]}px;`);
        clonedElemNode.trackId = id;
        clonedElemNode.addEventListener('transitionend',view.cloneTransitionEnded,false);
        event.target.parentNode.append(clonedElemNode);
        const catchClonedElement = document.getElementById(uniqueId);
        window.setTimeout(function(){
            catchClonedElement.setAttribute('style', `position:fixed;left:${destination[0]}px;top:${destination[1]}px;`);
            },0);
    },

    this.cloneTransitionEnded = (event) => {
        controller.loadTrack(event.target.trackId);
        event.target.remove();
    }

};

const controller = {
    init: () => {
        SC.initialize({client_id: model.user_id});
        controller.scPlayer = SC.Widget(view.scIFrame);
        //view.playPauseToggleButton.addEventListener('click', controller.playTrack,false);
    },

    /**
     * Checks if searched value is present in an array which holds searched titles,
     * @param {string} tracks - Items collection.
     * @param {string} id - string representing id of track.
     */
    getTrackById:
        (tracks,id) => {
            return tracks.filter(track => track.id === id)[0];
        },
    commitSearch:
        () => {
            const searchValue = view.searchGetInput.value;
            if (searchValue !== '') {
                controller.getTracks(searchValue).then(view.printCurrentResults);
                controller.addSearchToList(searchValue);
                view.inputMessage.setAttribute('visible','false');
            } else {
                view.inputMessage.setAttribute('visible','true');
            }
        },
    commitSearchByLastSearchResult:
        (searchString) => {
                controller.getTracks(searchString).then(view.printCurrentResults);
                view.dataDisplay.classList.add('displayed');
                view.searchDisplay.classList.remove('displayed');
        },
    getTracks: (word) => {
        return SC.get('/tracks', {
            q: word,
            limit: model.batchSlice,
            linked_partitioning: 1
        }).then(function (res) {
            model.currentResults = res.collection;
            model.nextHref = res.next_href;
            view.nextHrefButton.href = model.nextHref;
            view.printCurrentResults(model.currentResults);
        });
    },

    getNextBatch: function(event) {
        fetch(event.target.href, {
            method: 'get',
        })
            .then(res=>res.json())
            .then(res=> {model.currentResults = res.collection;
                model.nextHref = res.next_href;
                view.nextHrefButton.href = model.nextHref;})
            .then(()=>view.printCurrentResults(model.currentResults));
    },
    /**
     * Checks if searched value is present in an array which holds searched titles,
     * if not present in array already, it adds it.
     * @param {string} searchValue - Name of search title.
     */
    addSearchToList:
        (searchValue) => {
        // check for duplicates failed, add to list, cut list for five items length in total
            if(model.lastSearchedStrings.indexOf(searchValue) ===  -1){
                model.lastSearchedStrings.push(searchValue);
                const lastFiveSearches = model.lastSearchedStrings.slice(-1 * model.lastSearchesBatchSlice);
                model.lastSearchedStrings = lastFiveSearches;
            // check for duplicates passed, move item to last position
            } else {
                const hasElementPosition = model.lastSearchedStrings.indexOf(searchValue);
                const removedItem = model.lastSearchedStrings.splice(hasElementPosition,1);
                model.lastSearchedStrings.push(removedItem[0]);
            }
            // set last searches in local storage
            window.localStorage.setItem(model.LAST_SEARCHED, model.lastSearchedStrings);
            // print last searches in dom
            view.printLastSearches(model.lastSearchedStrings);
        },
    loadTrack:
        (id) => {
            const track = controller.getTrackById(model.currentResults,id);
            view.trackImage.src = track.artwork_url || view.defaultImg;
            view.trackImage.classList.add(view.isElemWideOrTall(view.trackImage));
            view.trackImage.classList.add('animate-img-entrance');
            view.trackImage.addEventListener('animationend',controller.animateImageEntranceEnded,false);
            model.currentTrackId = id;
            view.trackImage.trackId = id;
            view.imageHolder.addEventListener('click', controller.playTrack,false);
            view.playChosen.classList.add('loaded-item');
            view.soundCloudStrip.classList.add('soundcloud-strip--loaded-item');
        },
    animateImageEntranceEnded:
        (event) => {
            event.target.classList.remove('animate-img-entrance');
            view.trackImage.removeEventListener('animationend',controller.animateImageEntranceEnded,false);
        },
    playTrack:
        (event) => {
            view.imageHolder.removeEventListener('click', controller.playTrack,false);
            controller.scPlayer.load(`https://api.soundcloud.com/tracks/${event.target.trackId}`,{auto_play:true});
            view.playChosen.classList.remove('loaded-item');
        }
};

const model = new Model();
const view = new View(model);

document.addEventListener("DOMContentLoaded", model.init);
document.addEventListener("DOMContentLoaded", view.init);
document.addEventListener("DOMContentLoaded", controller.init);

