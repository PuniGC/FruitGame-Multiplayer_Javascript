export default function createGame() {
    const state = {
        players: {},
        fruits: {},
        screen: {
            width: 20,
            height: 20,
        }
    }
    const observers = []

    function start() {
        const frequency = 2000

        setInterval(addFruit, frequency)
    }

    function subscribe(observerFunction) {
        observers.push(observerFunction)
    }

    function notifyAll(command) {
        for (const observerFunction of observers) {
            observerFunction(command)
        }
    }

    function setState(newState) {
        Object.assign(state, newState)
    }

    function addPlayer(command) {
        const playerId = command.playerId
        const playerX = 'playerX' in command ? command.playerX : Math.floor(Math.random() * state.screen.width)
        const playerY = 'playerY' in command ? command.playerY : Math.floor(Math.random() * state.screen.height)
        const score = 0

        state.players[playerId] = {
            id: playerId,
            x: playerX,
            y: playerY,
            score
        }

        notifyAll({
            type: 'add-player',
            playerId,
            playerX,
            playerY,
            score
        })
    }

    function removePlayer(command) {
        const playerId = command.playerId

        delete state.players[playerId]

        notifyAll({
            type: 'remove-player',
            playerId
        })
    }

    function addFruit(command) {
        const fruitId = command ? command.fruitId : Math.floor(Math.random() * 10000000)
        const fruitX = command ? command.fruitX : Math.floor(Math.random() * state.screen.width)
        const fruitY = command ? command.fruitY : Math.floor(Math.random() * state.screen.height)

        state.fruits[fruitId] = {
            x: fruitX,
            y: fruitY
        }

        notifyAll({
            type: 'add-fruit',
            fruitId,
            fruitX,
            fruitY
        })
    }

    function removeFruit(command) {
        const fruitId = command.fruitId

        delete state.fruits[fruitId]

        notifyAll({
            type: 'remove-fruit',
            fruitId,
        })
    }

    function movePlayer(command) {
        notifyAll(command)

        const acceptedMoves = {
            ArrowUp(player){
                player.y = Math.max(player.y - 1, 0)
            },
            ArrowRight(player){
                player.x = Math.min(player.x + 1, state.screen.width-1)
            },
            ArrowDown(player){
                player.y = Math.min(player.y + 1, state.screen.height-1)
            },
            ArrowLeft(player){
                player.x = Math.max(player.x - 1, 0)
            }
        }

        const player = state.players[command.playerId]
        const moveFunction = acceptedMoves[command.keyPressed]

        if (player && moveFunction){
            moveFunction(player)
            checkForFruitCollision(command.playerId)
        }
    }

    function checkForFruitCollision(playerId) {
        const player = state.players[playerId]

        for (const fruitId in state.fruits) {
            const fruit = state.fruits[fruitId]

            if (player.x === fruit.x && player.y === fruit.y) {
                removeFruit({ fruitId })
                player.score += 1
            }
        }
    }

    return {
        addPlayer,
        removePlayer,
        movePlayer,
        addFruit,
        removeFruit,
        state,
        setState,
        subscribe,
        start
    }
}