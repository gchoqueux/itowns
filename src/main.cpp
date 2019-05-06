#include <emscripten/bind.h>

using namespace emscripten;

int say_hello()
{
  int o = 0;
  for (size_t i = 0; i < 1000000000; i++)
  {
    o++;
  }

  printf("%i", o);
  printf("Hello from your wasm module\n");

  return 0;
}



// #include <iostream>  
// using namespace std; 
// Recursive function to return gcd of a and b  
class gfg 
{ 
 public : int gcd(int a, int b){ 
    if (a == 0) 
        return b;  
    return gcd(b % a, a);  
 } 
  
   
// Function to return LCM of two numbers  
  int lcm(int a, int b)  
 {  
    return (a*b)/gcd(a, b);  
 }  
} ; 
// Driver program to test above function  
int toto()  
{  
    gfg g; 
    int a = 15, b = 20;
    printf("%i", g.lcm(a, b));
    printf("\nHello from your wasm module 2");

    // cout<<"LCM of "<<a<<" and "<<b<<" is "<<g.lcm(a, b);  
    return 0;  
}

EMSCRIPTEN_BINDINGS(my_module)
{
  function("sayHello", &say_hello);
  function("toto", &toto);
}
