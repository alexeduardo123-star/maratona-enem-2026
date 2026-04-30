cmake_minimum_required(VERSION 3.26)
project(alex_test CXX)

set(CMAKE_CXX_STANDARD 17)

add_executable(alex_test
        main.cpp
        avl.cpp
        rbtree.cpp
        benchmark.cpp
)