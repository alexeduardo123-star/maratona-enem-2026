#include <stdlib.h>
#include <string.h>
#include "rbtree.h"

int rotacoesRB = 0;
RBNode *raiz = NULL;

RBNode* novoRB(int score, char nome[]) {
    RBNode *n = (RBNode*) malloc(sizeof(RBNode));  
    n->score = score;
    strcpy(n->nome, nome);
    n->cor = RED;
    n->esq = n->dir = n->pai = NULL;
    return n;
}

void rotEsq(RBNode *x) {
    rotacoesRB++;
    RBNode *y = x->dir;
    x->dir = y->esq;

    if (y->esq) y->esq->pai = x;

    y->pai = x->pai;

    if (!x->pai) raiz = y;
    else if (x == x->pai->esq) x->pai->esq = y;
    else x->pai->dir = y;

    y->esq = x;
    x->pai = y;
}

void rotDir(RBNode *y) {
    rotacoesRB++;
    RBNode *x = y->esq;
    y->esq = x->dir;

    if (x->dir) x->dir->pai = y;

    x->pai = y->pai;

    if (!y->pai) raiz = x;
    else if (y == y->pai->esq) y->pai->esq = x;
    else y->pai->dir = x;

    x->dir = y;
    y->pai = x;
}

void corrigir(RBNode *z) {
    while (z->pai && z->pai->cor == RED) {
        if (z->pai == z->pai->pai->esq) {
            RBNode *y = z->pai->pai->dir;

            if (y && y->cor == RED) {
                z->pai->cor = BLACK;
                y->cor = BLACK;
                z->pai->pai->cor = RED;
                z = z->pai->pai;
            } else {
                if (z == z->pai->dir) {
                    z = z->pai;
                    rotEsq(z);
                }
                z->pai->cor = BLACK;
                z->pai->pai->cor = RED;
                rotDir(z->pai->pai);
            }
        } else {
            RBNode *y = z->pai->pai->esq;

            if (y && y->cor == RED) {
                z->pai->cor = BLACK;
                y->cor = BLACK;
                z->pai->pai->cor = RED;
                z = z->pai->pai;
            } else {
                if (z == z->pai->esq) {
                    z = z->pai;
                    rotDir(z);
                }
                z->pai->cor = BLACK;
                z->pai->pai->cor = RED;
                rotEsq(z->pai->pai);
            }
        }
    }
    raiz->cor = BLACK;
}

void inserirRB(int score, char nome[]) {
    RBNode *z = novoRB(score, nome);
    RBNode *y = NULL;
    RBNode *x = raiz;

    while (x) {
        y = x;
        if (z->score < x->score) x = x->esq;
        else x = x->dir;
    }

    z->pai = y;

    if (!y) raiz = z;
    else if (z->score < y->score) y->esq = z;
    else y->dir = z;

    corrigir(z);
}