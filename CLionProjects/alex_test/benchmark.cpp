#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#include "avl.h"
#include "rbtree.h"

#define OPERACOES 10000

void executarBenchmark() {

    AVLNode *avl = NULL;

    clock_t inicio, fim;
    double tempoAVL, tempoRB;

    srand(time(NULL));

    inicio = clock();
    for (int i = 0; i < OPERACOES; i++) {
        int score = rand() % 100000;
        char nome[50];
        sprintf(nome, "Jogador%d", i);
        avl = inserirAVL(avl, score, nome);
    }
    fim = clock();
    tempoAVL = (double)(fim - inicio) / CLOCKS_PER_SEC;

    inicio = clock();
    for (int i = 0; i < OPERACOES; i++) {
        int score = rand() % 100000;
        char nome[50];
        sprintf(nome, "Jogador%d", i);
        inserirRB(score, nome);
    }
    fim = clock();
    tempoRB = (double)(fim - inicio) / CLOCKS_PER_SEC;

    printf("\n===== RESULTADOS =====\n");

    printf("\nAVL:\n");
    printf("Tempo: %.5f s\n", tempoAVL);
    printf("Rotacoes: %d\n", rotacoesAVL);

    printf("\nRubro-Negra:\n");
    printf("Tempo: %.5f s\n", tempoRB);
    printf("Rotacoes: %d\n", rotacoesRB);
}