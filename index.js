//creation constants
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

//gamestat constants
const moveSpeed = 5;
const jumpHeight = 18;
const gravity = 0.7;

//canvas creation
canvas.width = 1024;
canvas.height = 576;
c.fillRect(0, 0, canvas.width, canvas.height);

const background = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    imageSrc: './img/background.png'
});

const shop = new Sprite({
    position: {
        x: 600,
        y: 128
    },
    imageSrc: './img/shop.png',
    scale: 2.75,
    framesMax: 6
});

//Initialise player and enemy
const player = new Fighter({position:{x:40, y:330}, velocity:{x:0, y:0}, offset: {x: 0, y: 0}, imageSrc: './img/samuraiMack/Idle.png', framesMax: 8, scale: 2.5, offset: {x: 225, y: 157},
    sprites: {
        idle: {
            imageSrc: './img/samuraiMack/Idle.png',
            framesMax: 8
        },
        run: {
            imageSrc: './img/samuraiMack/Run.png',
            framesMax: 8
        },
        jump: {
            imageSrc: './img/samuraiMack/Jump.png',
            framesMax: 2
        },
        fall: {
            imageSrc: './img/samuraiMack/Fall.png',
            framesMax: 2
        },
        attack1: {
            imageSrc: './img/samuraiMack/Attack1.png',
            framesMax: 6
        },
        takeHit: {
            imageSrc: './img/samuraiMack/Take hit - white silhouette.png',
            framesMax: 4
        },
        death: {
            imageSrc: './img/samuraiMack/Death.png',
            framesMax: 6
        }
    }, attackBox: {
        offset: {
            x: 50,
            y: 50
        },
        width: 200,
        height: 50
    }});

const enemy = new Fighter({position:{x:935, y:330}, velocity:{x:0, y:0}, color: 'blue', offset: {x: -50, y: 0}, imageSrc: './img/kenji/Idle.png', framesMax: 4, scale: 2.5, offset: {x: 215, y: 167},
sprites: {
    idle: {
        imageSrc: './img/kenji/Idle.png',
        framesMax: 4
    },
    run: {
        imageSrc: './img/kenji/Run.png',
        framesMax: 8
    },
    jump: {
        imageSrc: './img/kenji/Jump.png',
        framesMax: 2
    },
    fall: {
        imageSrc: './img/kenji/Fall.png',
        framesMax: 2
    },
    attack1: {
        imageSrc: './img/kenji/Attack1.png',
        framesMax: 4
    },
    takeHit: {
        imageSrc: './img/kenji/Take hit.png',
        framesMax: 3
    },
    death: {
        imageSrc: './img/kenji/Death.png',
        framesMax: 7
    }
}, attackBox: {
    offset: {
        x: -170,
        y: 50
    },
    width: 170,
    height: 50
}});

//handle key presses
const keys = {
    a: {pressed: false},
    d: {pressed: false},
    ArrowLeft: {pressed: false},
    ArrowRight: {pressed: false}
};

//important: first decerease timer call
decreaseTimer();

//game handling
function animate(){
    //loop animate
    window.requestAnimationFrame(animate);

    //update canvas objects
    c.fillStyle = 'black';
    c.fillRect(0, 0, canvas.width, canvas.height);

    background.update();

    shop.update();

    c.fillStyle = 'rgba(255, 255, 255, 0.15)';
    c.fillRect(0, 0, canvas.width, canvas.height);

    player.update();
    enemy.update();

    //reset player and enemy velocity
    player.velocity.x = 0;
    enemy.velocity.x = 0;

    //player movement
    if (keys.a.pressed && player.lastKey === 'a'){
        if (player.position.x > 40 && player.position.x <= 935) {
            player.velocity.x = -moveSpeed;
            player.switchSprite('run');
        }
    } else if (keys.d.pressed && player.lastKey === 'd'){
        if (player.position.x >= 40 && player.position.x < 935) {
            player.velocity.x = moveSpeed;
            player.switchSprite('run');
        }
    } else {
        player.switchSprite('idle');
    }

    //idle at outer zone
    if (player.position.x === 40 || player.position.x === 935) player.switchSprite('idle');

    //player jumping
    if (player.velocity.y < 0) {
        player.switchSprite('jump');
    } else if (player.velocity > 0) {
        player.switchSprite('fall');
    }

    //enemy movement
    if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft'){
        if (enemy.position.x > 40 && enemy.position.x <= 935) {
            enemy.velocity.x = -moveSpeed;
            enemy.switchSprite('run');
        }
    } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight'){
        if (enemy.position.x >= 40 && enemy.position.x < 935) {
            enemy.velocity.x = moveSpeed;
            enemy.switchSprite('run');
        }
    } else {
        enemy.switchSprite('idle');
    }

    //idle at outer zone
    if (enemy.position.x === 40 || enemy.position.x === 935) enemy.switchSprite('idle');

    //enemy jumping
    if (enemy.velocity.y < 0) {
        enemy.switchSprite('jump');
    } else if (enemy.velocity > 0) {
        enemy.switchSprite('fall');
    }

    //detect player colision & enemy hit
    if(rectangularCollision({rectangle1: player, rectangle2: enemy}) && player.isAttacking && player.framesCurrent === 4){
        enemy.takeHit();
        player.isAttacking = false;
        
        gsap.to('#enemyHealth', {
            width: enemy.health + '%'
        });
    }

    //if player misses
    if(player.isAttacking && player.framesCurrent >= 4) player.isAttacking = false;

    //detect enemy collision & player hit
    if(rectangularCollision({rectangle1: enemy, rectangle2: player}) && enemy.isAttacking && enemy.framesCurrent === 2){
        player.takeHit();
        enemy.isAttacking = false;
        
        gsap.to('#playerHealth', {
            width: player.health + '%'
        });
    }

    //if enemy misses
    if(enemy.isAttacking && enemy.framesCurrent >= 2) enemy.isAttacking = false;

    //end game based on health
    if(enemy.health <= 0 || player.health <= 0){
        determineWinner({player, enemy, timerId});
    }
}

//important: first animate call
animate();

//check for input start
window.addEventListener('keydown', (event) => {
    
    if (!player.dead) {
        switch(event.key){
            //movement
            case 'd':
                keys.d.pressed = true;
                player.lastKey = 'd';
                break;
            case 'a':
                keys.a.pressed = true;
                player.lastKey = 'a';
                break;
            case 'w':
                if (player.velocity.y === 0) player.velocity.y = -jumpHeight;
                break;

            //attack
            //case ' ':
                //player.attack();
                //break
            case 's':
                player.attack();
                break

            default:
                break;
        }
    }

    //enemy
    if (!enemy.dead) {
        switch (event.key) {
            //movement
            case 'ArrowRight':
                keys.ArrowRight.pressed = true;
                enemy.lastKey = 'ArrowRight';
                break;
            case 'ArrowLeft':
                keys.ArrowLeft.pressed = true;
                enemy.lastKey = 'ArrowLeft';
                break;
            case 'ArrowUp':
                if (enemy.velocity.y === 0) enemy.velocity.y = -jumpHeight;
                break;

            //attack
            case 'ArrowDown':
                enemy.attack();
                break;

            default:
                break;
        }
    }
});

//check for input end
window.addEventListener('keyup', (event) => {
    switch(event.key){
        //player keys
        case 'd':
            keys.d.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;

        //enemy keys
        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break;

        //default
        default: 
            break;
    }
});