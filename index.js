const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576 

c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.7

const background = new Sprite({
    position : {
        x : 0,
        y : 0
    },
    imageSrc: './img/background.png'
})

const shop = new Sprite({
    position : {
        x : 600,
        y : 128
    },
    imageSrc: './img/shop.png',
    scale: 2.75,
    framesMax: 6
})

const player = new Fighter({
    position : {
        x: 0,
        y: 0
    },
    velocity : {
        x: 0,
        y: 10
    },
    color : 'blue',
    offset : {
        x : 215,
        y : 157,
    },
    imageSrc: './img/samuraiMack/idle.png',
    framesMax: 8,
    scale: 2.5,
    sprites: {
        idle: {
            imageSrc: './img/samuraiMack/idle.png',
            framesMax: 8,
        },
        run: {
            imageSrc: './img/samuraiMack/run.png',
            framesMax: 8,
        },
        jump: {
            imageSrc: './img/samuraiMack/jump.png',
            framesMax: 2,
        },
        fall: {
            imageSrc: './img/samuraiMack/fall.png',
            framesMax: 2,
        },
        attack1: {
            imageSrc: './img/samuraiMack/attack1.png',
            framesMax: 6,
        },
        takeHit: {
            imageSrc: './img/samuraiMack/take hit - white.png',
            framesMax: 4,
        },
        death: {
            imageSrc: './img/samuraiMack/death.png',
            framesMax: 6,
        },

    },
    attackBox: {
        offset: {
            x: 100,
            y: 50
        },
        width: 160,
        height: 50
    }
})


const enemy = new Fighter({
    position : {
        x: 400,
        y: 100
    },
    velocity : {
        x: 0,
        y: 0
    },
    offset : {
        x : -50,
        y : 0
    },
    imageSrc: './img/kenji/idle.png',
    framesMax: 4,
    scale: 2.5,
    offset : {
        x:215,
        y:167
    },
    sprites: {
        idle: {
            imageSrc: './img/kenji/idle.png',
            framesMax: 4,
        },
        run: {
            imageSrc: './img/kenji/run.png',
            framesMax: 8,
        },
        jump: {
            imageSrc: './img/kenji/jump.png',
            framesMax: 2,
        },
        fall: {
            imageSrc: './img/kenji/fall.png',
            framesMax: 2,
        },
        attack1: {
            imageSrc: './img/kenji/attack1.png',
            framesMax: 4,
        },
        takeHit: {
            imageSrc: './img/kenji/Take Hit.png',
            framesMax: 3,
        },
        death: {
            imageSrc: './img/kenji/death.png',
            framesMax: 7,
        },
    },
    attackBox: {
        offset: {
            x: -170,
            y: 50
        },
        width: 170,
        height: 50
    }
})


console.log(player)

const keys = {
    a : {
        pressed : false
    },
    d : {
        pressed : false
    },
    w : {
        pressed : false
    },
    ArrowLeft : {
        pressed : false
    },
    ArrowRight : {
        pressed : false
    }
}

decreaseTimer()

function animate() {
    window.requestAnimationFrame(animate)
    // console.log('go')
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)
    background.update()
    shop.update()
    c.fillStyle = 'rgba(255, 255, 255, 0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.update()
    enemy.update()
    player.velocity.x = 0
    enemy.velocity.x = 0
    //Player Movement

    if(keys.a.pressed && player.lastKey === 'a') {
        player.velocity.x = -5
        player.switchSprites('run')
    } else if(keys.d.pressed && player.lastKey === 'd') {
        player.velocity.x = 5
        player.switchSprites('run')
    } else {
        player.switchSprites('idle')
    }

    //jumping and falling
    if(player.velocity.y < 0) {
        player.switchSprites('jump')
    } else if (player.velocity.y > 0) {
        player.switchSprites('fall')
    }
 
    //Enemy Movement
    
    if(keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
        enemy.velocity.x = -5
        enemy.switchSprites('run')
    } else if(keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
        enemy.velocity.x = 5
        enemy.switchSprites('run')
    } else {
        enemy.switchSprites('idle')
    }

    //jumping and falling
    if(enemy.velocity.y < 0) {
        enemy.switchSprites('jump')
    } else if (enemy.velocity.y > 0) {
        enemy.switchSprites('fall')
    }

    //Detecting Collision & taking hit
    if(rectangularCollision({
        rectangle1 : player,
        rectangle2 : enemy
    }) && player.isAttacking && player.framesCurrent === 4) {
        enemy.takeHit()
        player.isAttacking = false

        gsap.to('.eHealth', {
            width: enemy.health + '%'
        })
    }

    //if player misses
    if(player.isAttacking && player.framesCurrent === 4){
        player.isAttacking = false
    }

    if(rectangularCollision({
        rectangle1 : enemy,
        rectangle2 : player
    }) && enemy.isAttacking && player.framesCurrent === 2) {
        player.takeHit()
        enemy.isAttacking = false
        gsap.to('.pHealth', {
            width: player.health + '%'
        })
    }

    //if enemy misses
    if(enemy.isAttacking && enemy.framesCurrent === 2){
        enemy.isAttacking = false
    }

    //incase of draw (based on health)
    if(enemy.health <= 0 || player.health <= 0) {
        determineWinner({ player, enemy, timerId})
    }
}

animate()

window.addEventListener('keydown', (event) => {
    //Player Movements
    if(!player.dead) {
        switch (event.key) {
            case 'd':
                keys.d.pressed = true
                player.lastKey = 'd'
                break
            
            case 'a':
                keys.a.pressed = true
                player.lastKey = 'a'
                break
            case 'w':
                player.velocity.y = -15
                break

            case ' ':
                player.attack()
                break

            }
        }
        //Enemy Movements
        if(!enemy.dead) {
            switch(event.key) {
            case 'ArrowRight':
                keys.ArrowRight.pressed = true
                enemy.lastKey = 'ArrowRight'
                break

            case 'ArrowLeft':
                keys.ArrowLeft.pressed = true
                enemy.lastKey = 'ArrowLeft'
                break

            case 'ArrowUp':
                enemy.velocity.y = -15
                break

            case 'ArrowDown':
                enemy.attack()
                break
        }
    }
    // console.log(event.key)
})

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = false
            break
        
        case 'a':
            keys.a.pressed = false
            break

        case 'ArrowRight':
            keys.ArrowRight.pressed = false
            break
        
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false
            break
    }
    // console.log(event.key)
})