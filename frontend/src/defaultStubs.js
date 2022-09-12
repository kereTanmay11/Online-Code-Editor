const stubs = {};

stubs.cpp = `#include <iostream>
using namespace std;
int main()
{
cout << "Welcome to online code compiler";
return 0;
}
`;

stubs.py = `print("Welcome to online code compiler")`;

stubs.c = `#include <stdio.h>
int main() {
  printf("Welcome to online code compiler");
  return 0;
}
`;

export default stubs;