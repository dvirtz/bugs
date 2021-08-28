cmake_minimum_required(VERSION 3.10)

project(conan_bug)

list(APPEND CMAKE_PREFIX_PATH ${CMAKE_BINARY_DIR})
find_package(AWSSDK REQUIRED)

add_executable(test_package test_package.cpp)
target_link_libraries(test_package PRIVATE AWS::AWS)
