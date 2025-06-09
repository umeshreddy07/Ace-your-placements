class SystemDesign:
    """
    Template for system design problems.
    Replace this with your solution.
    """
    def __init__(self):
        self.components = {}
        self.interfaces = {}
        self.data_flows = []

    def add_component(self, name, type, description):
        """Add a component to the system."""
        self.components[name] = {
            'type': type,
            'description': description
        }

    def add_interface(self, source, target, protocol):
        """Define an interface between components."""
        self.interfaces[f"{source}-{target}"] = {
            'source': source,
            'target': target,
            'protocol': protocol
        }

    def add_data_flow(self, source, target, data_type):
        """Define a data flow between components."""
        self.data_flows.append({
            'source': source,
            'target': target,
            'data_type': data_type
        })

    def get_system_design(self):
        """Return the complete system design."""
        return {
            'components': self.components,
            'interfaces': self.interfaces,
            'data_flows': self.data_flows
        }

# Example usage
if __name__ == "__main__":
    # Create a new system design
    system = SystemDesign()
    
    # Add components
    system.add_component('Web Server', 'Server', 'Handles HTTP requests')
    system.add_component('Database', 'Storage', 'Stores application data')
    
    # Add interfaces
    system.add_interface('Web Server', 'Database', 'SQL')
    
    # Add data flows
    system.add_data_flow('Web Server', 'Database', 'User Data')
    
    # Get the complete design
    design = system.get_system_design()
    print("System Design:", design) 