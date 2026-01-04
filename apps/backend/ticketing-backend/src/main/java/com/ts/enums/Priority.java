package com.ts.enums;

public enum Priority {

	CRITICAL(1, "Critical"),
	HIGH(2,"High"),
	MEDIUM(3,"Medium"),
	LOW(4,"Low");
	
	private final int level;
	private final String label;
	
	Priority(int level, String label){
		this.level = level;
		this.label = label;
	}

	public int getLevel() {
		return level;
	}

	public String getLabel() {
		return label;
	}
	
	public static Priority fromLevel(int level) {
		for (Priority p : values()) {
			if (p.level == level) {
				return p;
			}
		}
		throw new IllegalArgumentException("Invalid priority level: "+level);
	}
	
	
}
