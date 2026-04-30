#include <stdlib.h>
#include <string.h>
#include "avl.h"

int rotacoesAVL = 0;

int altura(AVLNode *n) {
    return n ? n->altura : 0;
}

int max(int a, int b) {
    return (a > b) ? a : b;
}

AVLNode* novoAVL(int score, char nome[]) {
    AVLNode *n = (AVLNode*) malloc(sizeof(AVLNode));
    n->score = score;
    strcpy(n->nome, nome);
    n->altura = 1;
    n->esq = n->dir = NULL;
    return n;
}

AVLNode* rotDir(AVLNode *y) {
    rotacoesAVL++;
    AVLNode *x = y->esq;
    AVLNode *t2 = x->dir;

    x->dir = y;
    y->esq = t2;

    y->altura = max(altura(y->esq), altura(y->dir)) + 1;
    x->altura = max(altura(x->esq), altura(x->dir)) + 1;

    return x;
}

AVLNode* rotEsq(AVLNode *x) {
    rotacoesAVL++;
    AVLNode *y = x->dir;
    AVLNode *t2 = y->esq;

    y->esq = x;
    x->dir = t2;

    x->altura = max(altura(x->esq), altura(x->dir)) + 1;
    y->altura = max(altura(y->esq), altura(y->dir)) + 1;

    return y;
}

int balance(AVLNode *n) {
    return n ? altura(n->esq) - altura(n->dir) : 0;
}

AVLNode* inserirAVL(AVLNode *node, int score, char nome[]) {
    if (!node) return novoAVL(score, nome);

    if (score < node->score)
        node->esq = inserirAVL(node->esq, score, nome);
    else if (score > node->score)
        node->dir = inserirAVL(node->dir, score, nome);
    else
        return node;

    node->altura = 1 + max(altura(node->esq), altura(node->dir));

    int b = balance(node);

    if (b > 1 && score < node->esq->score)
        return rotDir(node);

    if (b < -1 && score > node->dir->score)
        return rotEsq(node);

    if (b > 1 && score > node->esq->score) {
        node->esq = rotEsq(node->esq);
        return rotDir(node);
    }

    if (b < -1 && score < node->dir->score) {
        node->dir = rotDir(node->dir);
        return rotEsq(node);
    }

    return node;
}

AVLNode* buscarAVL(AVLNode *root, int score) {
    if (!root || root->score == score) return root;
    if (score < root->score) return buscarAVL(root->esq, score);
    return buscarAVL(root->dir, score);
}