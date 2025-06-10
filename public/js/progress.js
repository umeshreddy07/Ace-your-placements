// Debounce utility function
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// The "Source of Truth" for all trackable items on the platform.
const MODULE_TOPICS = {
    aptitude: [
        'aptitude_numbers', 'aptitude_ages', 'aptitude_profit_loss', 'aptitude_time_work', 'aptitude_time_speed_distance',
        'aptitude_percentages', 'aptitude_ci_si', 'aptitude_ratio_proportion', 'aptitude_averages', 'aptitude_permutations',
        'aptitude_probability', 'aptitude_pipes_cisterns', 'aptitude_boats_streams', 'aptitude_area_volume', 'aptitude_calendar_clocks'
    ],
    coding: [
        // Languages
        'coding_c_basics', 'coding_c_flow', 'coding_c_functions', 'coding_c_pointers', 'coding_c_structs',
        'coding_java_basics', 'coding_java_oop', 'coding_java_collections', 'coding_java_exceptions', 'coding_java_io',
        'coding_python_basics', 'coding_python_ds', 'coding_python_functions', 'coding_python_oop', 'coding_python_comprehensions',
        // Core Concepts
        'coding_concept_bigo', 'coding_concept_recursion', 'coding_concept_sorting', 'coding_concept_hashing', 'coding_concept_bitmanip',
        'coding_concept_greedy', 'coding_concept_graphtrav', 'coding_concept_treetrav', 'coding_concept_kadane', 'coding_concept_slidingwin',
        // DSA Masterclass Categories
        'coding_dsa_arrays_category', 'coding_dsa_binary_search_category', 'coding_dsa_sliding_window_category', 'coding_dsa_stack_category',
        'coding_dsa_linked_list_category', 'coding_dsa_two_pointers_category', 'coding_dsa_trees_category', 'coding_dsa_heaps_category',
        'coding_dsa_backtracking_category', 'coding_dsa_graphs_category', 'coding_dsa_dp_category'
    ],
    technical: [
        // DBMS
        'technical_dbms_category', 'technical_dbms_sql_link', 'technical_dbms_normalization_link', 'technical_dbms_acid_link',
        'technical_dbms_indexing_link', 'technical_dbms_nosql_link', 'technical_dbms_injection_link', 'technical_dbms_concurrency_link',
        // OS
        'technical_os_category', 'technical_os_process_mgmt_link', 'technical_os_memory_mgmt_link', 'technical_os_deadlocks_link',
        'technical_os_syscalls_link', 'technical_os_ipc_link', 'technical_os_sync_link', 'technical_os_filesystems_link',
        // CN
        'technical_cn_category', 'technical_cn_osi_link', 'technical_cn_tcpudp_link', 'technical_cn_protocols_link', 'technical_cn_ip_link',
        'technical_cn_url_link', 'technical_cn_routing_link', 'technical_cn_security_link',
        // OOP
        'technical_oop_category', 'technical_oop_pillars_link', 'technical_oop_solid_link', 'technical_oop_patterns_link',
        'technical_oop_abstract_link', 'technical_oop_coupling_link', 'technical_oop_overloading_link',
        // System Design
        'technical_systemdesign_category', 'technical_sd_loadbalancing_link', 'technical_sd_caching_link', 'technical_sd_sharding_link',
        'technical_sd_cap_link', 'technical_sd_messagequeue_link', 'technical_sd_cdn_link', 'technical_sd_microservices_link',
        // DevOps
        'technical_devops_category', 'technical_se_git_link', 'technical_se_devops_link', 'technical_se_cicd_link',
        'technical_se_docker_link', 'technical_se_kubernetes_link', 'technical_se_agile_link', 'technical_se_iac_link',
        // Cloud
        'technical_cloud_category', 'technical_cloud_models_link', 'technical_cloud_types_link', 'technical_cloud_aws_link',
        'technical_cloud_serverless_link', 'technical_cloud_vm_container_link', 'technical_cloud_s3_link', 'technical_cloud_lambda_link',
        // Security
        'technical_security_category', 'technical_sec_cia_link', 'technical_sec_auth_link', 'technical_sec_hashing_link',
        'technical_sec_attacks_link', 'technical_sec_https_link', 'technical_sec_firewall_link', 'technical_sec_owasp_link'
    ],
    hr_interview: [
        'hr_q1', 'hr_q2', 'hr_q3', 'hr_q4', 'hr_q5', 'hr_q6', 'hr_q7', 'hr_q8', 'hr_q9', 'hr_q10',
        'hr_q11', 'hr_q12', 'hr_q13', 'hr_q14', 'hr_q15', 'hr_q16', 'hr_q17', 'hr_q18', 'hr_q19', 'hr_q20', 'hr_q21'
    ]
};

class ProgressTracker {
    constructor() {
        this.completedSubjects = {};
        this.progress = {};
        console.log("[ProgressTracker] Instance created.");
    }

    async init() {
        console.log("[ProgressTracker] Initializing...");
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn("No token found, cannot fetch progress from server.");
                return;
            }

            // ===================================================================
            // === FIX #1: The URL was wrong. This is the correct GET path. ===
            // ===================================================================
            const response = await fetch('/api/users/me/progress', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }
            const data = await response.json();
            this.completedSubjects = data.completedSubjects || {};
            this.progress = data.progress || {};
            console.log("[ProgressTracker] Progress successfully loaded from server:", this.progress);
        } catch (error) {
            console.error("[ProgressTracker] Failed to initialize from server:", error);
        }
    }

    categorizeSubtopic(subtopicId) {
        if (!subtopicId) return null;
        if (subtopicId.startsWith('hr_')) return 'hr_interview';
        if (subtopicId.startsWith('technical_')) return 'technical';
        if (subtopicId.startsWith('coding_')) return 'coding';
        if (subtopicId.startsWith('aptitude_')) return 'aptitude';
        return null;
    }

    isCompleted(subtopicId) {
        const category = this.categorizeSubtopic(subtopicId);
        if (!category) return false;
        
        let checkId = subtopicId;
        // Special handling for HR questions format consistency
        if (subtopicId.startsWith('hr_q')) {
            checkId = `hr_interview_question_${subtopicId.substring(4)}`;
        }

        return Array.isArray(this.completedSubjects[category]) &&
               this.completedSubjects[category].includes(checkId);
    }

    async setCompleted(subtopicId, completed) {
        console.log(`[ProgressTracker] Setting ${subtopicId} to ${completed}`);
        
        let serverSubtopicId = subtopicId;
        if (subtopicId.startsWith('hr_q')) {
            serverSubtopicId = `hr_interview_question_${subtopicId.substring(4)}`;
        }
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error("Cannot set progress: No auth token found.");
                return;
            }

            // ====================================================================
            // === FIX #2: The URL was wrong. This is the correct POST path. ===
            // ====================================================================
            const response = await fetch('/api/users/me/progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ subtopicId: serverSubtopicId, completed })
            });
                    
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown server error' }));
                throw new Error(`Server responded with status ${response.status}: ${errorData.message}`);
            }

            const dataFromServer = await response.json();
            console.log(`[ProgressTracker] Successfully updated on server.`);

            // Sync local state with the definitive state from the server
            this.completedSubjects = dataFromServer.completedSubjects;
            this.progress = dataFromServer.progress;

        } catch (error) {
            console.error("[ProgressTracker] CRITICAL: Failed to update progress on server.", error);
            alert("Failed to save progress. Please check your connection and try again. Your changes may not be saved.");
        }
    }
}

// Create a single global instance
if (typeof window.progressTrackerInstance === 'undefined') {
    window.progressTrackerInstance = new ProgressTracker();
}