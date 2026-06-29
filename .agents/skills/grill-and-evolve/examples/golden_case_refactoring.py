# Examples of Exception Handling: Bloated Defensive Coding vs. Karpathy Clean Style

# ==============================================================================
# ❌ Bloated & Defensive Programming (Violating Karpathy Simplicty & TDD)
# ==============================================================================
# This pattern tries to prevent crashes by wrapping everything in generic 
# catch-all blocks and silencing errors using 'pass' or 'continue'. This hides
# actual bugs and prevents writing meaningful tests.

def process_user_data_bloated(raw_data):
    try:
        user_id = raw_data['id']
        age = int(raw_data['age'])
    except Exception:
        # VIOLATION: Generic exception catch immediately followed by pass
        pass
        
    try:
        if age >= 18:
            return f"User {user_id} is an adult."
        else:
            return f"User {user_id} is a minor."
    except Exception:
        # VIOLATION: Another catch-all that hides potential issues
        pass

def process_batch_bloated(batch_list):
    results = []
    for item in batch_list:
        try:
            val = int(item)
            results.append(val * 2)
        except:
            # VIOLATION: Bare except followed by continue
            continue
    return results


# ==============================================================================
#  Karpathy Clean & TDD-Ready Style
# ==============================================================================
# Instead of catching and silencing exceptions, write pure functions with explicit
# parameter validation. Allow unexpected exceptions to propagate so they are
# visible during testing and debugging, or catch specific exceptions with proper 
# recovery/logging logic.

def process_user_data_clean(raw_data):
    """
    Processes user data by validating inputs explicitly instead of using 
    broad, silencing try/except blocks.
    """
    if 'id' not in raw_data or 'age' not in raw_data:
        raise ValueError("Invalid user structure: 'id' and 'age' are required.")
    
    try:
        age = int(raw_data['age'])
    except (ValueError, TypeError) as e:
        # Catching specific exceptions with clear error propagation/handling
        raise ValueError(f"Invalid age type: {raw_data['age']}") from e

    if age >= 18:
        return f"User {raw_data['id']} is an adult."
    return f"User {raw_data['id']} is a minor."

def process_batch_clean(batch_list):
    """
    Processes batch items by verifying types and propagating errors 
    or handling specific conversions.
    """
    results = []
    for item in batch_list:
        # Explicit validation instead of blanket silencing
        if isinstance(item, (int, float)):
            results.append(int(item) * 2)
        elif isinstance(item, str) and item.isdigit():
            results.append(int(item) * 2)
        else:
            # Explicit warning or error instead of silent continue
            raise ValueError(f"Unsupported batch item type: {item}")
    return results
