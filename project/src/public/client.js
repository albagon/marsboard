let store = Immutable.Map({
    user: Immutable.Map({ name: "Student" }),
    roversList: Immutable.List(['curiosity', 'opportunity', 'spirit']),
    rovers: Immutable.Map({ curiosity: Immutable.Map({ }),
                            opportunity: Immutable.Map({ }),
                            spirit: Immutable.Map({ })
                          })
})

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (newState) => {
    store = store.mergeDeep(newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}


// create content
const App = (state) => {

    return `
        <header></header>
        <main>
            ${Greeting(state.getIn(['user', 'name']))}
            <section>
                <h3>These are the rovers:</h3>
                ${AddRovers(state.get('roversList'), state.get('rovers'))}
            </section>
        </main>
        <footer></footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}

const AddRovers = (roversList, roversObject) => {
    const roversData = roversList.map(rover => DataOfRover(roversObject.get(rover), rover))
    return PrepareHtml(roversData)
}

// A pure function that renders infomation requested from the backend
const DataOfRover = (roverObject, roverName) => {
    // If rover's data does not exist, request it
    if (roverObject.size == 0 || typeof roverObject === 'undefined') {
        getRover(store, roverName)
    } else {
        return (`
            <div>
                <p>The name of the rover is ${roverObject.get('latest_photos').get(0).get('rover').get('name')}</p>
                <p>Its Launch Date is ${roverObject.get('latest_photos').get(0).get('rover').get('launch_date')}</p>
                <p>Its Landing Date is ${roverObject.get('latest_photos').get(0).get('rover').get('landing_date')}</p>
                <p>Its Status is ${roverObject.get('latest_photos').get(0).get('rover').get('status')}</p>
                <p>Its max_sol is ${roverObject.get('latest_photos').get(0).get('sol')}</p>
                <p>Date the most recent photos were taken is ${roverObject.get('latest_photos').get(0).get('earth_date')}</p>
                <div>${roverObject.get('latest_photos').slice(-4).reduce((acc, curr) => ReducePhotos(acc, curr), '')}</div>
            </div>
        `)
    }
}

const PrepareHtml = (roversData) => {
    const roversString = roversData.reduce((accum, rover) => {
                                        return accum + rover
                                    }, '')
    return roversString
}

const ReducePhotos = (acc, curr) => {
    const accumulator = acc + `<img src="${curr.get('img_src')}" width="100%" />`
    return accumulator
}

// ------------------------------------------------------  API CALLS

const getRover = (state, rover) => {
    fetch(`http://localhost:3000/latest-photos/${rover}`)
        .then(res => res.json())
        .then(data => {
                          const newRovers = {
                              rovers: {}
                          }
                          newRovers.rovers[rover] = data.photos
                          updateStore(newRovers)
                      })
}
