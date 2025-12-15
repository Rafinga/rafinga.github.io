# """
# A simple control flow graph IR for our toy language. Includes
# - Basic blocks
# - Instructions (non-SSA)
# """

# import abc
# import dataclasses

# from toy_ast import *


# @dataclasses.dataclass
# class BasicBlock:
#     insns: list["Insn"]


# class Insn(abc.ABC):
#     """The base class for all instructions.

#     insn is short for "instruction". You will see this abbreviation in many compiler
#     textbooks and papers."""


# # You will see dest, lhs, rhs, etc. annotated with "str". These should be the
# # names of your IR variables.


# @dataclasses.dataclass
# class BinOpInsn(Insn):
#     dest: str
#     op: BinOp
#     lhs: str
#     rhs: str


# @dataclasses.dataclass
# class UnaryOpInsn(Insn):
#     dest: str
#     op: UnaryOp
#     expr: str


# @dataclasses.dataclass
# class CopyInsn(Insn):
#     dest: str
#     src: str


# @dataclasses.dataclass
# class LoadConstInsn(Insn):
#     dest: str
#     value: int


# @dataclasses.dataclass
# class CallInsn(Insn):
#     func: str
#     args: list[str]


# @dataclasses.dataclass
# class JumpInsn(Insn):
#     target: BasicBlock


# @dataclasses.dataclass
# class BranchInsn(Insn):
#     cond: str  # Name to the condition variable
#     true_target: BasicBlock
#     false_target: BasicBlock


# def build_cfg(ast: list[Stmt]) -> BasicBlock:
#     """Build a control flow graph from the AST and return the entry block of the
#     resulting CFG."""

#     next_temp_id = 0

#     def next_temp_var() -> str:
#         """Generate a new temporary variable name."""
#         nonlocal next_temp_id
#         next_temp_id += 1
#         return f"t{next_temp_id}"

#     def build_expr(expr: Expr, cur_block: BasicBlock) -> tuple[BasicBlock, str]:
#         """Build the CFG for an expression whose evaluation starts at the end of
#         cur_block. Returns the block at the end of expr's evaluation and the
#         name of the (temporary) variable that holds the result."""

#         match expr:
#             case ConstExpr(value):
#                 dest = next_temp_var()
#                 cur_block.insns.append(LoadConstInsn(dest, value))
#                 return cur_block, dest
#             case VarExpr(name):
#                 return cur_block, name
#             case BinOpExpr(op, lhs, rhs) if op not in [BinOp.AND, BinOp.OR]:
#                 cur_block, lhs_temp = build_expr(lhs, cur_block)
#                 cur_block, rhs_temp = build_expr(rhs, cur_block)
#                 # Append the final instruction that combines the two results.
#                 dest = next_temp_var()
#                 cur_block.insns.append(BinOpInsn(dest, op, lhs_temp, rhs_temp))
#                 return cur_block, dest
#             case UnaryOpExpr(op, expr):
#                 cur_block, expr_temp = build_expr(expr, cur_block)
#                 dest = next_temp_var()
#                 cur_block.insns.append(UnaryOpInsn(dest, op, expr_temp))
#                 return cur_block, dest
#             case BinOpExpr(op, lhs, rhs) if op in [BinOp.AND, BinOp.OR]:
#                 next_block = BasicBlock(insns=[])
#                 dest = next_temp_var()
#                 build_cond(
#                     expr,
#                     cur_block,
#                     # If condition is true, set dest = 1 and jump to next_block
#                     BasicBlock(insns=[LoadConstInsn(dest, 1), JumpInsn(next_block)]),
#                     # If condition is false, set dest = 0 and jump to next_block
#                     BasicBlock(insns=[LoadConstInsn(dest, 0), JumpInsn(next_block)]),
#                 )
#                 return next_block, dest
#             case _:
#                 raise ValueError(f"Unknown expression: {expr}")

#     def build_cond(
#         expr: BinOpExpr,
#         cur_block: BasicBlock,
#         next_true_block: BasicBlock,
#         next_false_block: BasicBlock,
#     ) -> None:
#         """Build the CFG for a conditional expression starting at cur_block.
#         - next_true_block is the block to jump to if the condition is true
#         - next_false_block is the block to jump to if the condition is false
#         """
#         match expr:
#             case BinOpExpr(BinOp.AND, lhs, rhs):
#                 lhs_true_block = BasicBlock(insns=[])
#                 build_cond(lhs, cur_block, lhs_true_block, next_false_block)
#                 # RHS is only evaluated if lhs is true
#                 build_cond(rhs, lhs_true_block, next_true_block, next_false_block)
#             case BinOpExpr(BinOp.OR, lhs, rhs):
#                 lhs_false_block = BasicBlock(insns=[])
#                 build_cond(lhs, cur_block, next_true_block, lhs_false_block)
#                 # RHS is only evaluated if lhs is false
#                 build_cond(rhs, lhs_false_block, next_true_block, next_false_block)
#             case UnaryOpExpr(UnaryOp.NOT, expr):
#                 # Just swap the true and false blocks
#                 build_cond(expr, cur_block, next_false_block, next_true_block)
#             case _:
#                 # For other expressions, just evaluate the expression and branch
#                 # based on the result.
#                 cur_block, dest = build_expr(expr, cur_block)
#                 cur_block.insns.append(
#                     BranchInsn(dest, next_true_block, next_false_block)
#                 )

#     @dataclasses.dataclass
#     class Loop:
#         break_to: BasicBlock
#         continue_to: BasicBlock

#     def build_stmt(stmt: Stmt, cur_block: BasicBlock, loop: Loop | None) -> BasicBlock:
#         """Build the CFG for a statement starting at cur_block, returning the
#         block at the end of the statement (where the next statement starts)."""
#         match stmt:
#             case AssignStmt(name, expr):
#                 cur_block, dest = build_expr(expr, cur_block)
#                 cur_block.insns.append(CopyInsn(name, dest))
#                 return cur_block
#             case CallStmt(name, args):
#                 arg_temps = []
#                 for arg in args:
#                     cur_block, arg_temp = build_expr(arg, cur_block)
#                     arg_temps.append(arg_temp)
#                 cur_block.insns.append(CallInsn(name, arg_temps))
#                 return cur_block
#             case IfStmt(cond, body, else_body):
#                 next_block = BasicBlock(insns=[])  # The block after the whole if
#                 body_block = BasicBlock(insns=[])  # The block that starts the body
#                 if else_body:
#                     else_block = BasicBlock(insns=[])
#                     build_cond(cond, cur_block, body_block, else_block)
#                 else:
#                     build_cond(cond, cur_block, body_block, next_block)
#                 for stmt in body:  # Build the if body iteratively
#                     body_block = build_stmt(stmt, body_block, loop)
#                 # and don't forget to jump to next_block
#                 body_block.insns.append(JumpInsn(next_block))
#                 if else_body:  # Same for the else body if we have one
#                     for stmt in else_body:
#                         else_block = build_stmt(stmt, else_block, loop)
#                     else_block.insns.append(JumpInsn(next_block))
#                 return next_block
#             case WhileStmt(cond, body):
#                 next_block = BasicBlock(insns=[])  # The block after the whole loop
#                 body_block = BasicBlock(insns=[])  # The block that starts the body
#                 # The block that evaluates the loop condition
#                 # You will see many books and code referring to this as the "header"
#                 header_block = BasicBlock(insns=[])
#                 cur_block.insns.append(JumpInsn(header_block))
#                 build_cond(cond, header_block, body_block, next_block)

#                 cur_loop = Loop(break_to=next_block, continue_to=header_block)
#                 for stmt in body:
#                     body_block = build_stmt(stmt, body_block, cur_loop)
#                 # Jump back to the header block after the body
#                 body_block.insns.append(JumpInsn(header_block))
#                 return next_block
#             case BreakStmt():
#                 cur_block.insns.append(JumpInsn(loop.break_to))
#                 return BasicBlock(insns=[])
#                 # Above we return an empty block as the block that follows the break.
#                 # The fact is all code after the break is unreachable, and no edges
#                 # will go into the empty block above.
#             case ContinueStmt():
#                 cur_block.insns.append(JumpInsn(loop.continue_to))
#                 return BasicBlock(insns=[])  # Same as break
#             case _:
#                 raise ValueError(f"Unknown statement: {stmt}")

#     # Now, build the CFG.
#     entry_block = BasicBlock(insns=[])
#     cur_block = entry_block
#     for stmt in ast:
#         cur_block = build_stmt(stmt, cur_block, None)
#     return entry_block


# # ======================================================================================
# # There is absolutely NO NEED to read the rest of this file.
# # ======================================================================================


# def to_graphviz(cfg: BasicBlock) -> str:
#     output = (
#         'digraph G {\n    rankdir=TB;\n    node [shape=record, fontname="Courier"];\n'
#     )
#     node_id = 0

#     def next_node_name():
#         nonlocal node_id
#         node_id += 1
#         return f"node_{node_id}"

#     def append(s: str):
#         nonlocal output
#         output += f"    {s};\n"

#     block_to_name: dict[int, str] = {}

#     def visit(block: BasicBlock) -> str:
#         if (name := block_to_name.get(id(block))) is not None:
#             return name
#         name = next_node_name()
#         block_to_name[id(block)] = name
#         node_text = "{"
#         for insn in block.insns:
#             match insn:
#                 case LoadConstInsn(dest, value):
#                     node_text += f"{dest} = const {value}\\l  "
#                 case CopyInsn(dest, src):
#                     node_text += f"{dest} = {src}\\l  "
#                 case BinOpInsn(dest, op, lhs, rhs):
#                     node_text += f"{dest} = {op.name.lower()} {lhs}, {rhs}\\l  "
#                 case UnaryOpInsn(dest, op, expr):
#                     node_text += f"{dest} = {op.name.lower()} {expr}\\l  "
#                 case CallInsn(func, args):
#                     node_text += f"call {func}({', '.join(args)})\\l  "
#                 case JumpInsn(_):
#                     node_text += f"jump\\l"
#                 case BranchInsn(cond, _, _):
#                     node_text += f"br {cond}\\l|{{<s0>T|<s1>F}}"
#         node_text += "}"
#         append(f'{name} [label="{node_text}"]')
#         match block.insns:
#             case [*_, JumpInsn(target)]:
#                 target_name = visit(target)
#                 append(f"{name} -> {target_name} [tailport=s]")
#             case [*_, BranchInsn(_, true_target, false_target)]:
#                 true_name = visit(true_target)
#                 false_name = visit(false_target)
#                 append(f"{name}:s0 -> {true_name}")
#                 append(f"{name}:s1 -> {false_name}")
#         return name

#     visit(cfg)
#     output += "}"
#     return output


# def test():
#     """Ad hoc function to test things out"""

#     from toy_ast import parse
#     from utils import show_graphviz

#     source = """
# x = (a + b) / (a * -b)
# while x > 0:
#     if x == 1:
#         break
#     elif not (x < 1):
#         x = x - 2
#         continue
#     x = x + 2
# print(x)
# """.strip()

#     ast = parse(source)
#     entry = build_cfg(ast)
#     show_graphviz(to_graphviz(entry))


# if __name__ == "__main__":
#     test()