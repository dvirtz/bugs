cmake_minimum_required(VERSION 3.24)

project(conan-arrow-re2)

################# dependencies #################

set(CONAN_CMAKE_VERSION 0.18.1)
if(NOT EXISTS "${CMAKE_BINARY_DIR}/conan-${CONAN_CMAKE_VERSION}.cmake")
  message(STATUS "Downloading conan.cmake from https://github.com/conan-io/cmake-conan")
  file(DOWNLOAD "https://raw.githubusercontent.com/conan-io/cmake-conan/${CONAN_CMAKE_VERSION}/conan.cmake"
       "${CMAKE_BINARY_DIR}/conan-${CONAN_CMAKE_VERSION}.cmake" TLS_VERIFY ON)
endif()

set_directory_properties(PROPERTIES CMAKE_CONFIGURE_DEPENDS conanfile.txt)

include(${CMAKE_BINARY_DIR}/conan-${CONAN_CMAKE_VERSION}.cmake)

conan_cmake_autodetect(settings)
if(CMAOE_BUILD_TYPE STREQUAL Debug)
  set(COMPILER_RUNTIME MTD)
else()
  set(COMPILER_RUNTIME MT)
endif()
list(TRANSFORM settings REPLACE "compiler.runtime=.*" "compiler.runtime=${COMPILER_RUNTIME}")

conan_cmake_install(
  PATH_OR_REFERENCE
  ${CMAKE_SOURCE_DIR}
  BUILD
  missing
  SETTINGS
  ${settings})

list(APPEND CMAKE_PREFIX_PATH ${CMAKE_BINARY_DIR})

find_package(arrow REQUIRED CONFIG)

################################################

add_executable(${PROJECT_NAME} reader_writer.cpp)
target_link_libraries(${PROJECT_NAME} PRIVATE arrow::arrow)
target_compile_features(${PROJECT_NAME} PRIVATE cxx_std_17)
