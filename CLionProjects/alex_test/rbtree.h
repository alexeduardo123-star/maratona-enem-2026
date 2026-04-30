#ifndef RBTREE_H
#define RBTREE_H

typedef enum { RED, BLACK } Cor;

typedef struct RBNode {
    int score;
    char nome[50];
    Cor cor;
    struct RBNode *esq, *dir, *pai;
} RBNode;

void inserirRB(int score, char nome[]);
extern int rotacoesRB;

#endif