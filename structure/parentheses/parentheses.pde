// Mitchell Griest
// October 2017
// Every Processing Method with Examples
// 
// Parentheses
// https://processing.org/reference/parentheses.html

println("Grouping expressions with parentheses:");

int x = (2 + 3) * 4;
// Thanks to the parentheses, this is evaluated s:
// (2 + 3) * 4 =
// (6) * 4 =
// 24
println("(2 + 3) * 4 = " + x);

int y = 2 + 3 * 4;
// With no Parentheses, this is evaluated as:
// 2 + (3 * 4) =
// 2 + 12 =
// 14
// (due to order of operations)
println("2 + 3 * 4 = " + y);