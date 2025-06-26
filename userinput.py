#user_input = input("prompt: ")

user_input = input("prompt: ")
print(f"User entered: {user_input}")

if user_input.lower() == "stop":
    print("Exiting...")
    exit()
else:
    print("Continue with next task based on input...")