#ifndef AVL_H
#define AVL_H

typedef struct AVLNode {
    int score;
    char nome[50];
    int altura;
    struct AVLNode *esq, *dir;
} AVLNode;

AVLNode* inserirAVL(AVLNode *node, int score, char nome[]);
AVLNode* buscarAVL(AVLNode *root, int score);

extern int rotacoesAVL;

#endif