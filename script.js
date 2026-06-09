// PaintBoom
const tela = document.querySelector("canvas");
const c = tela.getContext("2d");

tela.width = window.innerWidth;
tela.height = window.innerHeight;

// tela de pintura separada para calcular porcentagens sem afetar a tela principal
const telaPintura = document.createElement("canvas");
telaPintura.width = tela.width;
telaPintura.height = tela.height;
const cp = telaPintura.getContext("2d");

const gravidade = 0.5;
const totalPixels = tela.width * tela.height;

// criar plataformas na tela
const plataformas = [
    { x: 80,                      y: tela.height - 120, largura: 180, altura: 15 },
    { x: 350,                     y: tela.height - 200, largura: 180, altura: 15 },
    { x: 650,                     y: tela.height - 150, largura: 180, altura: 15 },
    { x: 950,                     y: tela.height - 220, largura: 180, altura: 15 },
    { x: tela.width - 260,        y: tela.height - 130, largura: 180, altura: 15 },
    { x: 200,                     y: tela.height - 330, largura: 160, altura: 15 },
    { x: 500,                     y: tela.height - 360, largura: 160, altura: 15 },
    { x: 800,                     y: tela.height - 340, largura: 160, altura: 15 },
    { x: tela.width - 320,        y: tela.height - 310, largura: 160, altura: 15 },
    { x: 350,                     y: tela.height - 490, largura: 160, altura: 15 },
    { x: 650,                     y: tela.height - 510, largura: 160, altura: 15 },
    { x: tela.width - 400,        y: tela.height - 480, largura: 160, altura: 15 },
];

// criar bombas que caem do topo
const bombas = [];
function criarBomba(){
    bombas.push({
        x: Math.random() * (tela.width - 100) + 50,
        y: -20,
        raio: 14,
        dy: 2
    });
}
setInterval(criarBomba, 3000);
criarBomba();

const jogador1 = { x: 100, y: 100, raio: 20, cor: "blue",  dx: 0, dy: 0, velocidade: 5, pulos: 0 };
const jogador2 = { x: 300, y: 100, raio: 20, cor: "green", dx: 0, dy: 0, velocidade: 5, pulos: 0 };

const teclas = {};

// controle de movimento e pulo dos jogadores
addEventListener("keydown", (e)=>{
    teclas[e.key] = true;
    if(e.key === "w"       && jogador1.pulos < 3){ jogador1.dy = -10; jogador1.pulos++; }
    if(e.key === "ArrowUp" && jogador2.pulos < 3){ jogador2.dy = -10; jogador2.pulos++; }
});
addEventListener("keyup", (e)=>{ teclas[e.key] = false; });

function mover(){
    jogador1.dx = teclas["a"] ? -jogador1.velocidade : teclas["d"] ? jogador1.velocidade : 0;
    jogador2.dx = teclas["ArrowLeft"] ? -jogador2.velocidade : teclas["ArrowRight"] ? jogador2.velocidade : 0;
}

//fisica dos jogadores, colisão com plataformas e limites da tela
function fisica(jogador){
    jogador.dy += gravidade;
    jogador.x += jogador.dx;
    jogador.y += jogador.dy;

    if(jogador.y + jogador.raio > tela.height){
        jogador.y = tela.height - jogador.raio;
        jogador.dy = 0; jogador.pulos = 0;
    }
    for(const plat of plataformas){
        const fundoAnterior = jogador.y + jogador.raio - jogador.dy;
        const dentroX = jogador.x + jogador.raio > plat.x && jogador.x - jogador.raio < plat.x + plat.largura;
        if(dentroX && fundoAnterior <= plat.y && jogador.y + jogador.raio >= plat.y && jogador.dy >= 0){
            jogador.y = plat.y - jogador.raio;
            jogador.dy = 0; jogador.pulos = 0;
        }
    }
    if(jogador.x - jogador.raio < 0)            jogador.x = jogador.raio;
    if(jogador.x + jogador.raio > tela.width)   jogador.x = tela.width - jogador.raio;
}

function distancia(ax, ay, bx, by){ return Math.hypot(ax - bx, ay - by); }

function atualizarBombas(){
    for(let i = bombas.length - 1; i >= 0; i--){
        const b = bombas[i];
        b.dy += 0.1;
        b.y += b.dy;

        if(b.y + b.raio > tela.height){ explodirBomba(b, null); bombas.splice(i,1); continue; }

        let acertouPlat = false;
        for(const plat of plataformas){
            if(b.x > plat.x && b.x < plat.x + plat.largura && b.y + b.raio >= plat.y && b.y + b.raio <= plat.y + plat.altura + 5){
                explodirBomba(b, null); bombas.splice(i,1); acertouPlat = true; break;
            }
        }
        if(acertouPlat) continue;

        if(distancia(b.x, b.y, jogador1.x, jogador1.y) < b.raio + jogador1.raio){
            explodirBomba(b, jogador1); bombas.splice(i,1); continue;
        }
        if(distancia(b.x, b.y, jogador2.x, jogador2.y) < b.raio + jogador2.raio){
            explodirBomba(b, jogador2); bombas.splice(i,1); continue;
        }
    }
}

function explodirBomba(bomba, jogador){
    cp.fillStyle = jogador ? jogador.cor : "#888";
    cp.beginPath();
    cp.arc(bomba.x, bomba.y, 60, 0, Math.PI * 2);
    cp.fill();
}

function pintar(jogador){
    cp.fillStyle = jogador.cor;
    cp.beginPath();
    cp.arc(jogador.x, jogador.y, jogador.raio, 0, Math.PI * 2);
    cp.fill();
}

function contarPorcentagem(cor){
    const dados = cp.getImageData(0, 0, telaPintura.width, telaPintura.height).data;
    let contagem = 0;
    const rgb = cor === "blue" ? [0, 0, 255] : cor === "green" ? [0, 128, 0] : [0,0,0];
    for(let i = 0; i < dados.length; i += 4){
        if(dados[i] === rgb[0] && dados[i+1] === rgb[1] && dados[i+2] === rgb[2]) contagem++;
    }
    return ((contagem / totalPixels) * 100).toFixed(1);
}

let pctAzul = "0.0", pctVerde = "0.0";
let contadorFrames = 0;

// tempo total do jogo em segundos
const duracaoSegundos = 40;
const inicioTempo = Date.now();

function desenharPlataformas(){
    for(const plat of plataformas){
        c.fillStyle = "#555";
        c.fillRect(plat.x, plat.y, plat.largura, plat.altura);
    }
}
// desenhar bombas 
function desenharBombas(){
    for(const b of bombas){
        c.fillStyle = "black";
        c.beginPath();
        c.arc(b.x, b.y, b.raio, 0, Math.PI * 2);
        c.fill();
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(b.x, b.y - b.raio);
        c.lineTo(b.x + 5, b.y - b.raio - 8);
        c.stroke();
    }
}

function desenharJogador(jogador){
    c.fillStyle = jogador.cor;
    c.beginPath();
    c.arc(jogador.x, jogador.y, jogador.raio, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "#111";
    c.lineWidth = 3;
    c.beginPath();
    c.arc(jogador.x, jogador.y, jogador.raio, 0, Math.PI * 2);
    c.stroke();
}
// desenhar HUD com porcentagens e tempo restante
function desenharHUD(tempoRestante){
    c.fillStyle = "rgba(0,0,0,0.5)";
    c.fillRect(10, 10, 160, 75);
    c.font = "bold 16px monospace";
    c.fillStyle = "blue";
    c.fillText("Azul:  " + pctAzul + "%", 20, 32);
    c.fillStyle = "green";
    c.fillText("Verde: " + pctVerde + "%", 20, 54);
    c.fillStyle = "white";
    c.fillText("Tempo: " + tempoRestante + "s", 20, 76);
}

// tela de fim de jogo mostrando o vencedor e as porcentagens finais
function FimDeJogo(){
    c.fillStyle = "rgba(0,0,0,0.7)";
    c.fillRect(0, 0, tela.width, tela.height);
    c.font = "bold 48px monospace";
    c.textAlign = "center";
    const vencedor = parseFloat(pctAzul) >= parseFloat(pctVerde) ? "AZUL VENCEU" : "VERDE VENCEU";
    c.fillStyle = parseFloat(pctAzul) >= parseFloat(pctVerde) ? "blue" : "green";
    c.fillText(vencedor, tela.width / 2, tela.height / 2 - 20);
    c.fillStyle = "white";
    c.font = "bold 24px monospace";
    c.fillText("Azul: " + pctAzul + "%   Verde: " + pctVerde + "%", tela.width / 2, tela.height / 2 + 30);
}

function animar(){
    const tempoDecorrido = Math.floor((Date.now() - inicioTempo) / 1000);
    const tempoRestante = Math.max(0, duracaoSegundos - tempoDecorrido);

    requestAnimationFrame(animar);

    if(tempoRestante <= 0){
        c.clearRect(0, 0, tela.width, tela.height);
        c.drawImage(telaPintura, 0, 0);
        FimDeJogo();
        return;
    }

    mover();
    fisica(jogador1);
    fisica(jogador2);
    pintar(jogador1);
    pintar(jogador2);
    atualizarBombas();

    contadorFrames++;
    if(contadorFrames % 30 === 0){
        pctAzul = contarPorcentagem("blue");
        pctVerde = contarPorcentagem("green");
    }

    c.clearRect(0, 0, tela.width, tela.height);
    c.drawImage(telaPintura, 0, 0);
    desenharPlataformas();
    desenharBombas();
    desenharJogador(jogador1);
    desenharJogador(jogador2);
    desenharHUD(tempoRestante);
}

animar();